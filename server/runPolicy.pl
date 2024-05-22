#!/usr/bin/perl
use strict;
use POSIX qw(strftime);
use File::Basename;
use Cwd 'abs_path';
use Parallel::ForkManager;

#SETTINGS
my $GPFSPOLICYEXECNODES = "policyServers"; #which GPFS nodes/nodelcass to use to run policy engine on
my $FSPATH = $ARGV[0] || die;  #The path you want to report on
my $OUTPUTDIR = $ARGV[1] || die; #where you want the results


my $EXECPATH = abs_path(dirname(__FILE__));
my $TEMPLATE = "$EXECPATH/listTemplate.full.metadata.pol";
my $FS_LABEL = $FSPATH;
$FS_LABEL =~ s/\W//g;
my $TIME = strftime "%Y-%m-%d-%H-%M-%S", localtime;
my $WORKDIR = "$OUTPUTDIR/logs/$TIME\_full";
my $TMPDIR = "$OUTPUTDIR/tmp";
my $POLICYFILENAME = "listaccessed.pol";
my $EXECFILENAME = "listaccessed.sh";
my $LOCKFILE = "$OUTPUTDIR/.lock";
system("mkdir -p $WORKDIR");
system("mkdir -p $TMPDIR");
my $REPORTDIR = "$WORKDIR/individual_usage_reports";
system("mkdir -p $REPORTDIR");
my $WEBREPORTDIR = "$OUTPUTDIR/web_reports";
system("mkdir -p $WEBREPORTDIR");
die unless -e $WORKDIR;
die unless -e $TEMPLATE;
die unless -e $FSPATH;
die unless -e $REPORTDIR;
die unless -e $WEBREPORTDIR;
die "ALREADY RUNNING!" if -e $LOCKFILE;


open my $fh, '<', $TEMPLATE or die "Can't open file $!";
read $fh, my $policy, -s $fh;
close $fh;

chdir $WORKDIR;

open my $of, '>', $POLICYFILENAME or die "Can't open file $!";
print $of $policy;
close $of;

open my $of, '>', $EXECFILENAME or die "Can't open file $!";
print $of "#!/bin/bash\n";
print $of "/usr/lpp/mmfs/bin/mmapplypolicy $FSPATH -P $WORKDIR/$POLICYFILENAME -I defer -f $WORKDIR -s $TMPDIR -N $GPFSPOLICYEXECNODES\n";
close $of;
system("touch $LOCKFILE");
system("chmod +x $EXECFILENAME");
system("bash $EXECFILENAME &> $EXECFILENAME\.log");

#read the file list and add up the totals for each fileset
my %filesetReport;
my %filesetReportByPathFH;
open($filesetReportByPathFH{"other"},">$REPORTDIR/other");
open(my $list, "$WORKDIR/list.mmfindList");
while (<$list>)
{
	chomp;
	my $line = $_;
	my @entry = split /\s+/;
	my $size = $entry[12];
	if($entry[15] =~ /^$FSPATH\/([a-zA-Z0-9_\-\.]+)/)
	{
		my $name = $1;
		open($filesetReportByPathFH{$name},">$REPORTDIR/usage_$name") unless $filesetReportByPathFH{$name};
		print { $filesetReportByPathFH{$name} } "$line\n";
	}
	else
	{
		print { $filesetReportByPathFH{"other"} } "$line\n";
	}
}
close $list;
system("rm $WORKDIR/list.mmfindList");
my $forkManager = Parallel::ForkManager->new(10);    #2 concurrent

for my $r (glob("$REPORTDIR/usage_*"))
{
	$forkManager->start and next;
	my $outputJson = basename($r) . ".sorted.gz.DU.json.gz";
	system("sort -S 8\% --parallel=10 $r > $r\.sorted");
	system("cat $r\.sorted | $EXECPATH/dugen.pl | gzip > $WEBREPORTDIR/$outputJson");
	#system("rm $r $r.sorted");
	$forkManager->finish;
}

system("rm $LOCKFILE");
