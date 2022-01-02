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

// get submission history of a problem by its id
async function getSubmissionById(frontendId) {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  // console.log(frontendId, allProblemStatus[frontendId.toString()]);
  try {
    var backendId =
      allProblemStatus[frontendId.toString()]["stat"]["question_id"];
    var questionSlug =
      allProblemStatus[frontendId.toString()]["stat"]["question__title_slug"];
  } catch (error) {
    // console.log(error);
    // console.log(frontendId, backendId, allProblemStatus[frontendId.toString()]);
  }

  // make http request to get the submission history json

  var makeRequest = async () => {
    return await fetch("https://leetcode.com/graphql", {
      credentials: "include",
      headers: {
        "User-Agent": window.navigator.userAgent,
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "content-type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Cookie:
          "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
      },
      referrer:
        "https://leetcode.com/problems/" + questionSlug + "/submissions/",
      body:
        '{"operationName":"Submissions","variables":{"offset":0,"limit":100,"lastKey":null,"questionSlug":"' +
        questionSlug +
        '"},"query":"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
      method: "POST",
      mode: "cors",
    }).then(async (response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log(frontendId + " request 429");
        return await makeRequest();
      }
    });
  };

  var json = await makeRequest();
  // console.log(json)
  return json["data"]["submissionList"]["submissions"];
}

// get user's all problems status
// from https://leetcode.com/api/problems/algorithms/
async function getUserAllProblemStatus() {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  var json = await fetch("https://leetcode.com/api/problems/algorithms/", {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "User-Agent": window.navigator.userAgent,
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

// get the submission information from a list of question ids
async function getSubmissions(submissionIds) {
  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  var json = {};
  var promises = [];
  submissionIds.forEach((e) => {
    if (
      e in allProblemStatus &&
      allProblemStatus[e.toString()]["status"] != null
    ) {
      promises.push(
        getSubmissionById(e).then((data) => (json[e.toString()] = data))
      );
    }
  });

  await Promise.all(promises);
  return json;
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

/**
 * Script to change Status column to corresponding session count number.
 *
 * Status class notes:
 * * Accepted: text-green-s
 * * Error: text-yellow
 * * Not attempted: text-gray-5
 */

/**
 * Column name modifications.
 *
 * Columns:
 * 1. "Status" -> "Status/# of Sess."
 * 2. new "Your Acceptance"
 * 3. "Acceptance" -> "Public Acceptance"
 */
var colnames = function (problems_colnames) {
  var colname_status = problems_colnames.childNodes[0];
  var colname_title = problems_colnames.childNodes[1];
  var colname_accept = problems_colnames.childNodes[4];
  var colname_frequency = problems_colnames.childNodes[5];

  // "Status/# of Sess."
  colname_status.innerHTML = colname_status.innerHTML.replace(
    "Status",
    "Status/# of Sess."
  );

  // "Your Acceptance"
  var colname_your_accept = colname_frequency.cloneNode(true);
  colname_your_accept.innerHTML = colname_your_accept.innerHTML.replace(
    "Frequency",
    "Your Acceptance"
  );
  problems_colnames.insertBefore(colname_your_accept, colname_title);

  // "Public Acceptance"
  colname_accept.innerHTML = colname_accept.innerHTML.replace(
    "Acceptance",
    "Public Acceptance"
  );
};

/**
 * Function to manipulate Status column.
 *
 * For each row:
 * 1. Check if current problem is accepted
 * 2. If accepted, check if current problem is in DATA IMPORTED
 * 3. If is in,
 * 3-1. replace "Status" column value with session count number
 * 3-2. add "Your Acceptance" column value
 * 4. If not in, add empty "Your Acceptance" column value
 *
 * Future update:
 * 1. Construct https://developer.mozilla.org/en-US/docs/Web/API/NodeList live `NodeList` and update when expanding # of problems,
 *    or do other stuff while url does not change per page.
 */
var eachRow = function (row_element_nodes, data_num_sessions, data_acceptance) {
  var problem_status = row_element_nodes.childNodes[0];
  var problem_title = row_element_nodes.childNodes[1];
  var problem_frequency = row_element_nodes.childNodes[5];

  // Check if accepted
  var is_accepted =
    problem_status.childNodes[0].classList.contains("text-green-s");
  var current_problem = null;

  if (is_accepted) {
    var title_selector = problem_title.childNodes[0].querySelector(".h-5");
    if (title_selector != null) {
      current_problem = title_selector.childNodes[0].textContent;
    }
  }

  // Check if in DATA IMPORTED
  var session_count = null;
  var accept_value = null;
  if (
    current_problem != null &&
    Object.keys(data_num_sessions).includes(current_problem) &&
    Object.keys(data_acceptance).includes(current_problem)
  ) {
    session_count = data_num_sessions[parseInt(current_problem)];
    accept_value = data_acceptance[parseInt(current_problem)];
  }

  // Replace "Status" column
  if (session_count != null) {
    const session_count_element = document.createElement("span");
    session_count_element.innerHTML = `&#x2713 ${session_count}`;
    session_count_element.classList.add("text-olive");
    session_count_element.classList.add("dark:text-dark-olive");

    problem_status.childNodes[0].replaceWith(session_count_element);
  }

  // Add "Your Acceptance" value
  const your_accept_element = problem_frequency.cloneNode(true);
  if (accept_value != null) {
    const accept_value_float = parseFloat(accept_value) * 100;
    your_accept_element.childNodes[0].innerHTML = `<span>${parseInt(
      accept_value_float
    )}%</span>`;
  } else {
    your_accept_element.childNodes[0].innerHTML = `<span>N/A</span>`;
  }

  row_element_nodes.insertBefore(your_accept_element, problem_title);
};

/**
 * Run page modification actions.
 */
var run_page_update = function (data_num_sessions, data_acceptance) {
  var problems_table = document.querySelector("div[role='rowgroup']");
  var problems_rows = problems_table.querySelectorAll("div[role='row']");
  var problems_colnames = problems_table.previousSibling.childNodes[0];
  colnames(problems_colnames);
  problems_rows.forEach((element) =>
    eachRow(element, data_num_sessions, data_acceptance)
  );
};

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

  // getSubmissions(curr_problems_on_page)
  //   .then((json_data) => {
  //     console.log("begin");
  //     return get_acc_rate(json_data);
  //   }) //get_num_sessions or get_acc_rate
  //   .then((data) => console.log(data));

  getSubmissions(curr_problems_on_page).then((json_data) => {
    console.log("begin");
    run_page_update(get_num_sessions(json_data), get_acc_rate(json_data));
  });

  last_problems_on_page = curr_problems_on_page;
}, 1000);
