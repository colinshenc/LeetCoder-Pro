// this file runs on the web page and cannot access chrome.cookie api

var allProblemStatus = null;

// wrapper to get cookie value
async function getCookieValue(cookieName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(chrome.runtime.id, {name: cookieName}, (response) => {
            if (response) {
                resolve(response);
            } else {
                reject("Cannot find cookie " + cookieName)
            }
        });
    })
}

async function getSubmissionById(questionId) {

    var csrftoken = await getCookieValue('csrftoken');
    var leetcode_session = await getCookieValue('LEETCODE_SESSION');

    if (allProblemStatus == null) {
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
            "Cookie": "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session
        },
        "referrer": "https://leetcode.com/problems/" + questionSlug + "/submissions/",
        "body": "{\"operationName\":\"Submissions\",\"variables\":{\"offset\":0,\"limit\":100,\"lastKey\":null,\"questionSlug\":\"" + questionSlug + "\"},\"query\":\"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors"
    }).then(response => response.json());

    return json['data']['submissionList']['submissions'];
}

async function getUserAllProblemStatus() {

    var csrftoken = await getCookieValue('csrftoken');
    var leetcode_session = await getCookieValue('LEETCODE_SESSION');

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
            "Cookie": "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session
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


async function getSubmissions(submissionIds) {
    if (allProblemStatus == null) {
        allProblemStatus = await getUserAllProblemStatus();
    }

    var json = {} 
    for(var i = 0; i < submissionIds.length; i++) {
        var questionId = submissionIds[i];
        // only handle problems with submission status
        if(allProblemStatus[questionId.toString()]['status'] != null) {
            json[submissionIds[i].toString()] = await getSubmissionById(submissionIds[i]);
        }
    }
    return json
}

// var testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// getSubmissions(testArray).then((json) => console.log(json));