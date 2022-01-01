// this file runs on the web page and cannot access chrome.cookie api

var allProblemStatus = null;

// wrapper to get cookie value
async function getCookieValue(cookieName) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      { name: cookieName },
      (response) => {
        if (response) {
          resolve(response);
        } else {
          reject("Cannot find cookie " + cookieName);
        }
      }
    );
  });
}

async function getSubmissionById(questionId) {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  var questionSlug =
    allProblemStatus[questionId.toString()]["stat"]["question__title_slug"];

  var json = await fetch("https://leetcode.com/graphql", {
    credentials: "include",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "content-type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Cookie:
        "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
    },
    referrer: "https://leetcode.com/problems/" + questionSlug + "/submissions/",
    body:
      '{"operationName":"Submissions","variables":{"offset":0,"limit":100,"lastKey":null,"questionSlug":"' +
      questionSlug +
      '"},"query":"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
    method: "POST",
    mode: "cors",
  }).then((response) => {
    if(response.ok) {
      return response.json()
    } else {
      console.log(response.statusText);
      // if request failed, resubmit same request
      return getSubmissionById(questionId);
    }
  });

  return json["data"]["submissionList"]["submissions"];
}

async function getUserAllProblemStatus() {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  var json = await fetch("https://leetcode.com/api/problems/algorithms/", {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      Cookie:
        "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
    },
  }).then((response) => response.json());

  // rebuild json with frontend_question_id as key for faster lookup
  var newJson = {};
  for (var i = 0; i < json["stat_status_pairs"].length; i++) {
    var problem = json["stat_status_pairs"][i];
    newJson[problem["stat"]["frontend_question_id"].toString()] = problem;
  }

  return newJson;
}

async function getSubmissions(submissionIds) {
  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  var json = {};
  promises = []
  submissionIds.forEach((e) => {
    if ((e in allProblemStatus) && allProblemStatus[e.toString()]["status"] != null) {
      promises.push(getSubmissionById(e).then(data => json[e.toString()] = data));
    }
  })

  return Promise.all(promises);
}

/**
 * Input JSON string-submissions data.Output map with key as question number, value as session count.
 */
const get_num_sessions = (json_data) => {
  var result = {};
  //var json_data = JSON.parse(data);
  for (var qNum in json_data) {
    //console.log(qNum);
    //console.log(json_data[qNum]);
    var sub_count = 1;
    var last_ts = json_data[qNum][0];
    for (var sub of json_data[qNum]) {
      //console.log(sub.timestamp);
      if (Math.abs(last_ts - sub.timestamp) > 86400) {
        sub_count = sub_count + 1;
      }
      last_ts = sub.timestamp;
    }
    result[qNum] = sub_count;
  }
  return result;
};

//const data_num_sessions = get_num_sessions(data);

/**
 * Input JSON string-submissions data. Output map with key as question number, value as acceptance rate.
 */
const get_acc_rate = (json_data) => {
  var result = {};
  var ac_count = 0;
  for (var qNum in json_data) {
    var ac_count = json_data[qNum].reduce((prev_count, curr) => {
      prev_count = curr.statusDisplay.includes("Accepted")
        ? prev_count + 1
        : prev_count;
      return prev_count;
    }, 0);
    result[qNum] = (ac_count / json_data[qNum].length).toFixed(2);
  }
  return result;
};

//const data_acceptance = get_acc_rate(data);
//export { data_num_sessions, data_acceptance };

//NEW changes, get problem numbers every 500ms from DOM.
//console.log(Date.now());
var last_problems_on_page;
var curr_problems_on_page;
setInterval(() => {
  curr_problems_on_page = Array.from(document.querySelectorAll(".h-5"))
    .filter((node) => node.innerHTML.match("\\d+\\.( \\w*)+"))
    .map((node) =>
      parseInt(node.innerText.substring(0, node.innerText.indexOf(".")))
    );
  if (
    JSON.stringify(last_problems_on_page) ==
    JSON.stringify(curr_problems_on_page)
  ) {
    return;
  }
  console.log(curr_problems_on_page);
  getSubmissions(curr_problems_on_page)
    .then((json_data) => {
      console.log("begin");
      return get_acc_rate(json_data);
    }) //get_num_sessions or get_acc_rate
    .then((data) => console.log(data));
  last_problems_on_page = curr_problems_on_page;
}, 1000);
