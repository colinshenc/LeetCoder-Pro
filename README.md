 <h2>LeetCoder Pro</h2>
 <h3>A simple LeetCode browser extension that provides software engineer interview prepers key problem familiarity data points. :hugs: :100:</h3>

**Statistics definition** 
 - Session: Two submissions count as two different sessions if they are submitted more than one day apart.
 - Acceptance Rate(personal): Ratio of accepted submissions to all submissions.
 
 **Key files**
 - ```manifest.json```: Config file that contains key details of the browser extension and tells the browser to run ```submission.js``` when page finishing reloading. 
  - ```submission.js```: Script that asynchronously fetch submission data from LeetCode using browser's cookies API```getSubmissions()```. After getting the data, processing them and generating data points to be displayed on LeetCode's problems page. Finally display the data inside two columns added on the page.

***Contributors***
- Vincenqwu(https://github.com/Vincenqwu): research extension publication process,extension pop-up page,extension control logic.
- zzarc(https://github.com/zzarc): HTTP request, async retrieve submission data from LeetCode API,adapt code for both firefox and chrome platforms.
- AnnieNew(https://github.com/AnnieNew): research extension publication process,design demo images,gifs for chrome store publication.
- Cheng Shen(https://github.com/colinshenc): project proposition,stats conversion from retrieved LeetCode submission data,data display and update on webpage,DOM manipulation. 

![alt text](https://github.com/colinshenc/Leetcode_familiarity_add_on/blob/main/extensions/images/logo6.png)

***How to use LeetCoder Pro***
- <h3>Note:To enable this extension, please log into (or register) your LeetCode account. In order to show data you must have submitted solutions before.</h3>
> Written by Cheng Shen with [StackEdit](https://stackedit.io/).
> Jan 21, 2022
