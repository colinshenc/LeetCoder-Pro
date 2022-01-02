var data_url = chrome.runtime.getURL("./parse_ts.js");

import { data_num_sessions, data_acceptance } from data_url;

/**
 * Script to change Status column to corresponding session count number.
 *
 * Status class notes:
 * * Accepted: text-green-s
 * * Error: text-yellow
 * * Not attempted: text-gray-5
 */

var problems_table = document.querySelector("div[role='rowgroup']");
var problems_rows = problems_table.querySelectorAll("div[role='row']");
var problems_colnames = problems_table.previousSibling.childNodes[0];

/**
 * Taken from:
 * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"
 * class="w-[18px] h-[18px] text-gray-5 dark:text-dark-gray-5">
 *   <path fill-rule="evenodd" d="M4 12a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd">
 *   </path>
 * </svg>
 */
// var null_dash_element = function () {
//   const inner_element = document.createElement("path");
//   inner_element.setAttribute("fill-rule", "evenodd");
//   inner_element.setAttribute(
//     "d",
//     "M4 12a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z"
//   );
//   inner_element.setAttribute("clip-rule", "evenodd");

//   const element = document.createElement("svg");
//   element.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//   element.setAttribute("viewBox", "0 0 24 24");
//   element.setAttribute("width", "1em");
//   element.setAttribute("height", "1em");
//   element.setAttribute("fill", "currentColor");
//   element.setAttribute(
//     "class",
//     "w-[18px] h-[18px] text-gray-5 dark:text-dark-gray-5"
//   );
//   element.appendChild(inner_element);

//   return element;
// };

/**
 * Column name modifications.
 *
 * Columns:
 * 1. new "Your Acceptance"
 * 2. "Acceptance" -> "Public Acceptance"
 */
var colnames = function () {
  var colname_title = problems_colnames.childNodes[1];
  var colname_accept = problems_colnames.childNodes[4];
  var colname_frequency = problems_colnames.childNodes[5];

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
var eachRow = function (row_element_nodes) {
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
    your_accept_element.childNodes[0].innerHTML = `<span>${accept_value_float}%</span>`;
  } else {
    your_accept_element.childNodes[0].innerHTML = `<span>N/A</span>`;
  }

  row_element_nodes.insertBefore(your_accept_element, problem_title);
};

colnames();
problems_rows.forEach((element) => eachRow(element));
