# DUgen
like agedu but web-based javascript

This was created to run off file listing output from spectrum scale's policy engine. 

### To create the data:
 - create an output directory for all the files : ex: mkdir myoutput
 - runPolicy.pl [path_to_analyze] [outputf_file]
 for example: runPolicy.pl /home /tmp/dugen
 - you may need to install perl modules such as Parallel::ForkManager
 - For the Spectrum Scale Policy Engine, you should set the appropriate nodeclass to run the polcy on. This is at the top of runPolicy.pl:
 - my $GPFSPOLICYEXECNODES = "policyServers";
 - change policyServers to whatever is appropriate for your site

### Output:
- within the output dir you will have a web_reports dir that contains a seperate json.gz file for each subdir under [path_to_analyiz]
- so if you ran it on /home and /home contains /home/foo and /home/bar, there will be two output json.gz files.
- Copy these files to your webservers data/ directory 



### Viewing:
- upload the git repo to your web server, the index.html should be at the top. data/ contains your json.gz reports, from the output above.
- to view a specific report (for example /home/foo), pass it as an id argument in the URL:
- https://myserver?id=usage_foo
- clicking on the bars will drill down into the dirs
  
![screenshot](images/Screenshot.png?raw=true "screenshot")


### developers
- if you want to supply your own json data, and not use GPFS or policy engines, the javascript will render as long it follows the following standard:


```
    dirs": [
            {
                "dir": "/",
                "size": 7426150203392,
                "coldsize": 5857942831104,
                "children": [
                    "/dirA", "/dirB"
                ]
            },
            {
                "dir": "/dirA",
                "size": 7426150203390,
                "coldsize": 5857942831100,
                "children": [
                                   ]
            },
            {
                "dir": "/dirB",
                "size": 200,
                "coldsize": 400,
                "children": [
                    
                ]
            }
```
