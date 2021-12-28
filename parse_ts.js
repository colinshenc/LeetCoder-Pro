//templatea JSON data.
var data = `{
	"322":[
		{
			"id":"604919532",
			"statusDisplay":"Accepted",
			"lang":"java",
			"runtime":"22 ms",
			"timestamp":"1640079343",
			"url":"/submissions/detail/604919532/",
			"isPending":"Not Pending",
			"memory":"38.5 MB",
			"__typename":"SubmissionDumpNode"},
			{"id":"604910291","statusDisplay":"Accepted","lang":"java","runtime":"22 ms","timestamp":"1640077490","url":"/submissions/detail/604910291/","isPending":"Not Pending","memory":"38.7 MB","__typename":"SubmissionDumpNode"},
			{"id":"604908586","statusDisplay":"Accepted","lang":"java","runtime":"23 ms","timestamp":"1640077159","url":"/submissions/detail/604908586/","isPending":"Not Pending","memory":"39.3 MB","__typename":"SubmissionDumpNode"},
			{"id":"603930494","statusDisplay":"Accepted","lang":"java","runtime":"22 ms","timestamp":"1639900752","url":"/submissions/detail/603930494/","isPending":"Not Pending","memory":"38.8 MB","__typename":"SubmissionDumpNode"},
			{"id":"603928174","statusDisplay":"Time Limit Exceeded","lang":"java","runtime":"N/A","timestamp":"1639900322","url":"/submissions/detail/603928174/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"603925515","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1639899821","url":"/submissions/detail/603925515/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"603924217","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1639899578","url":"/submissions/detail/603924217/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"603923985","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1639899534","url":"/submissions/detail/603923985/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"565767204","statusDisplay":"Accepted","lang":"java","runtime":"63 ms","timestamp":"1633372316","url":"/submissions/detail/565767204/","isPending":"Not Pending","memory":"42.3 MB","__typename":"SubmissionDumpNode"},
			{"id":"565767146","statusDisplay":"Accepted","lang":"java","runtime":"71 ms","timestamp":"1633372309","url":"/submissions/detail/565767146/","isPending":"Not Pending","memory":"42.6 MB","__typename":"SubmissionDumpNode"},
			{"id":"565767008","statusDisplay":"Accepted","lang":"java","runtime":"55 ms","timestamp":"1633372293","url":"/submissions/detail/565767008/","isPending":"Not Pending","memory":"42.3 MB","__typename":"SubmissionDumpNode"},
			{"id":"533586867","statusDisplay":"Accepted","lang":"java","runtime":"32 ms","timestamp":"1628145445","url":"/submissions/detail/533586867/","isPending":"Not Pending","memory":"38.4 MB","__typename":"SubmissionDumpNode"},
			{"id":"533543648","statusDisplay":"Accepted","lang":"java","runtime":"31 ms","timestamp":"1628139620","url":"/submissions/detail/533543648/","isPending":"Not Pending","memory":"38.5 MB","__typename":"SubmissionDumpNode"},
			{"id":"533542854","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1628139513","url":"/submissions/detail/533542854/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"533542771","statusDisplay":"Accepted","lang":"java","runtime":"32 ms","timestamp":"1628139501","url":"/submissions/detail/533542771/","isPending":"Not Pending","memory":"39.3 MB","__typename":"SubmissionDumpNode"},
			{"id":"533542308","statusDisplay":"Accepted","lang":"java","runtime":"31 ms","timestamp":"1628139438","url":"/submissions/detail/533542308/","isPending":"Not Pending","memory":"38.7 MB","__typename":"SubmissionDumpNode"},
			{"id":"533531194","statusDisplay":"Accepted","lang":"java","runtime":"11 ms","timestamp":"1628137828","url":"/submissions/detail/533531194/","isPending":"Not Pending","memory":"38.5 MB","__typename":"SubmissionDumpNode"},
			{"id":"533508089","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1628134323","url":"/submissions/detail/533508089/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"533504497","statusDisplay":"Runtime Error","lang":"java","runtime":"N/A","timestamp":"1628133749","url":"/submissions/detail/533504497/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"},
			{"id":"533503828","statusDisplay":"Wrong Answer","lang":"java","runtime":"N/A","timestamp":"1628133637","url":"/submissions/detail/533503828/","isPending":"Not Pending","memory":"N/A","__typename":"SubmissionDumpNode"}
		],
  "1": [
    {
      "id": "605309170",
      "statusDisplay": "Accepted",
      "lang": "python3",
      "runtime": "824 ms",
      "timestamp": "1640145190",
      "url": "/submissions/detail/605309170/",
      "isPending": "Not Pending",
      "memory": "14.9 MB",
      "__typename": "SubmissionDumpNode"
    },
    {
      "id": "605308685",
      "statusDisplay": "Wrong Answer",
      "lang": "python3",
      "runtime": "N/A",
      "timestamp": "1640145119",
      "url": "/submissions/detail/605308685/",
      "isPending": "Not Pending",
      "memory": "N/A",
      "__typename": "SubmissionDumpNode"
    }
  ],
  "9": [
    {
      "id": "606462590",
      "statusDisplay": "Accepted",
      "lang": "python3",
      "runtime": "68 ms",
      "timestamp": "1640348500",
      "url": "/submissions/detail/606462590/",
      "isPending": "Not Pending",
      "memory": "14.2 MB",
      "__typename": "SubmissionDumpNode"
    }
  ]
}`;
// var json_data = JSON.parse(data);
// console.log(json_data["1"][0].timestamp);
//console.log(Object.keys(data));

/**
 * Input JSON string-submissions data.Output map with key as question number, value as session count.
 */
const get_num_sessions = (data) => {
  var result = {};
  var json_data = JSON.parse(data);
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
      //console.log(sub.timestamp);
      //console.log("a");
    }
    result[qNum] = sub_count;
  }
  return result;
};
//console.log("a");
console.log(get_num_sessions(data));

/**
 * Input JSON string-submissions data. Output map with key as question number, value as acceptance rate.
 */
const get_acc_rate = (data) => {
  var result = {};
  var json_data = JSON.parse(data);
  var ac_count = 0;
  for (var qNum in json_data) {
    var ac_count = json_data[qNum].reduce((prev_count, curr) => {
      prev_count = curr.statusDisplay.includes("Accepted")
        ? prev_count + 1
        : prev_count;
      return prev_count;
    }, 0);
    //console.log(ac_count);
    //console.log(json_data[qNum].length);
    result[qNum] = ac_count / json_data[qNum].length;
  }
  return result;
};
console.log(get_acc_rate(data));
