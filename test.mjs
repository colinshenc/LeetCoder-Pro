import fetch from 'node-fetch'

var allProblemStatus = undefined

async function getSubmissionById(questionId) {

    // var csrftoken = getCookieValue('csrftoken');
    // var leetcode_session = getCookieValue('LEETCODE_SESSION');

    if (allProblemStatus == undefined) {
        allProblemStatus = await getUserAllProblemStatus()
    }
    if(allProblemStatus[questionId.toString()]['status'] == null) {
        return [];
    }

    var questionSlug = allProblemStatus[questionId.toString()]['stat']['question__title_slug']

    var json = await fetch("https://leetcode.com/graphql", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "content-type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Cookie": "csrftoken=Rkg99BfyDgIaamxO8wvxUfgKuhIzCflIGusAMCrgzqIwqYRcumEwK6whLAeU7pJs; LEETCODE_SESSION=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNTQ1MTc4OSIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiN2JlNWNhMmRkMWYyZmI3Zjc3ZDcxOTI1OTZjMDM1M2Y3NWYwYWRjNSIsImlkIjo1NDUxNzg5LCJlbWFpbCI6InR3YWRkd2FAZ21haWwuY29tIiwidXNlcm5hbWUiOiJ0d2FkZHdhIiwidXNlcl9zbHVnIjoidHdhZGR3YSIsImF2YXRhciI6Imh0dHBzOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvODEwOWRkMmE3ZmY1M2Q0ZjY5MzE4ODc5ZDM0OTI0YjgucG5nP3M9MjAwIiwicmVmcmVzaGVkX2F0IjoxNjQwNDMwODIyLCJpcCI6IjEwNy4xODIuMjIuNTMiLCJpZGVudGl0eSI6ImNiYTEwMzBmNDRlYjRiYTQ1NjhiZjQ1YzI1NDAyMjhjIiwic2Vzc2lvbl9pZCI6MTYwMDM3NzYsIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.DL-aOkKbYcj9YWFiN-NKBoQ1MJUYRRZesd0jmklytlo",
        },
        "referrer": "https://leetcode.com/problems/" + questionSlug + "/submissions/",
        "body": "{\"operationName\":\"Submissions\",\"variables\":{\"offset\":0,\"limit\":20,\"lastKey\":null,\"questionSlug\":\"" + questionSlug + "\"},\"query\":\"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors"
    }).then(response => response.json());

    return json['data']['submissionList']['submissions'];
}

async function getUserAllProblemStatus() {

    // var csrftoken = getCookieValue('csrftoken');
    // var leetcode_session = getCookieValue('LEETCODE_SESSION');

    var json = await fetch("https://leetcode.com/api/problems/algorithms/", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cookie": "csrftoken=Rkg99BfyDgIaamxO8wvxUfgKuhIzCflIGusAMCrgzqIwqYRcumEwK6whLAeU7pJs; LEETCODE_SESSION=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNTQ1MTc4OSIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiN2JlNWNhMmRkMWYyZmI3Zjc3ZDcxOTI1OTZjMDM1M2Y3NWYwYWRjNSIsImlkIjo1NDUxNzg5LCJlbWFpbCI6InR3YWRkd2FAZ21haWwuY29tIiwidXNlcm5hbWUiOiJ0d2FkZHdhIiwidXNlcl9zbHVnIjoidHdhZGR3YSIsImF2YXRhciI6Imh0dHBzOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvODEwOWRkMmE3ZmY1M2Q0ZjY5MzE4ODc5ZDM0OTI0YjgucG5nP3M9MjAwIiwicmVmcmVzaGVkX2F0IjoxNjQwNDMwODIyLCJpcCI6IjEwNy4xODIuMjIuNTMiLCJpZGVudGl0eSI6ImNiYTEwMzBmNDRlYjRiYTQ1NjhiZjQ1YzI1NDAyMjhjIiwic2Vzc2lvbl9pZCI6MTYwMDM3NzYsIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.DL-aOkKbYcj9YWFiN-NKBoQ1MJUYRRZesd0jmklytlo",
        },
    }).then(response => response.json());

    // rebuild json with question_id as key for faster lookup
    var newJson = {};
    for(var i = 0; i < json['stat_status_pairs'].length; i++) {
        var problem = json['stat_status_pairs'][i];
        newJson[problem['stat']['question_id'].toString()] = problem;
    }

    return newJson;
}

var testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function isSolved(questionId) {
    if (allProblemStatus == undefined) {
        allProblemStatus = await getUserAllProblemStatus();
    }
    if(allProblemStatus[questionId.toString()]['status'] == null) {
        return false;
    }
    return true;
}


async function getSubmissions(submissionIds) {
    var json = {} 
    for(var i = 0; i < submissionIds.length; i++) {
        var questionId = submissionIds[i];
        if(await isSolved(questionId)) {
            json[submissionIds[i].toString()] = await getSubmissionById(submissionIds[i]);
        }
    }
    return json
}

// let json = await getSubmissionJSON('two-sum')
// console.log(json['data']['submissionList'])

// let json = await getUserAllProblemStatus()
// let json = await getSubmissionById(1)
let json = await getSubmissions(testArray)
console.log(json);