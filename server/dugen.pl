#!/usr/bin/perl
use strict;
use POSIX qw(strftime);
use File::Basename;
use Cwd 'abs_path';
use Time::Piece ;
#SETTINGS
#my $MAXDEPTH = 12;
my $BLOCKSIZE = 32768;
my %dirs;
my %children;
my $OLD_FILE_LIMIT = -1; #files older than 1 year from today
my $ageCutoffDate = localtime->add_years($OLD_FILE_LIMIT) ;
my $i = 0;
while (<>)
{
	$i++;
	print STDERR "." if $i % 10000 == 0;
	print STDERR "\n" if $i % 1000000 == 0;
	chomp;
	my $line = $_;
	my @entry = split /\s+/,$_,16;
	my $mode = $entry[11];
	next if($mode =~ /^d/);
	my $fileDateStr = $entry[7];
	my $fileDate = Time::Piece->strptime($fileDateStr, "%Y-%m-%d");
	my $coldSizeUsage = 0;
	my $size = $entry[12];
	my $sizeUsage = (($size + $BLOCKSIZE) - ($size % $BLOCKSIZE));
	$coldSizeUsage = $sizeUsage if $fileDate < $ageCutoffDate;
	my $path = $entry[15];
	my $fileDir = dirname $path;
	$dirs{$fileDir}{"total"} += $sizeUsage;
	$dirs{$fileDir}{"cold"} += $coldSizeUsage;
	while($fileDir ne "/")
	{
		$fileDir = dirname $fileDir;
		$dirs{$fileDir}{"total"} += $sizeUsage;
		$dirs{$fileDir}{"cold"} += $coldSizeUsage;
	}

}
print STDERR "read $i file records\n";

for my $dir (keys %dirs)
{
	my $parent = $dir;
	while($dir ne "/")
	{
		$parent = dirname $dir;
		$children{$parent}{$dir} = 1;
		$dir = $parent;
	}

}

#print "$_ $dirs{$_}\n" for sort keys %dirs;

print "{\n \"dirs\": [\n";
my @keys = sort keys %dirs;
for my $i (0..$#keys)
{
	my $dir = $keys[$i];
        #fix bad chars in names
	my $dirCleanLabel = $dir;
	$dirCleanLabel =~ s/[^\w\s-\.\/]+/_/g;
#	my $depth =  $dir =~ tr/\///;
#	next if $depth > $MAXDEPTH;
	print "\t{\n";
	print "\t\t\"dir\": \"$dirCleanLabel\",\n";
	print "\t\t\"size\": " . $dirs{$dir}{"total"} . ",\n";
	print "\t\t\"coldsize\": " . $dirs{$dir}{"cold"} . ",\n";
	print "\t\t\"children\": ";
	my @subdirs =  sort keys %{$children{$dir}};
	@subdirs = map { local $_ = $_; s/[^\w\s-\.\/]+/_/g; $_ } @subdirs;
	@subdirs = map { "\"$_\"" } @subdirs;
	my $subDirString = join ",", @subdirs;
	print "[$subDirString]\n";
	print "\t}";
	print "," unless $i == $#keys;
	print "\n";
}
print "]\n}\n";

