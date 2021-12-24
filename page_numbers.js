//number of question per page
var temp = document.querySelector("#headlessui-listbox-button-12").textContent;
var num = temp.substr(0, temp.indexOf("/") - 1);

//get current problem page number on leetcode
function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    console.log(sURLVariables);
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];


        }
    }
    return "1";
}​

var pageNum=GetURLParameter("page");
//should return "1" for first page, "2" for second page, so on.

//return an array of problem number on current page:[1,2,3,4,...]
const getProblemsRangeOnCurrentPage = (pageNum,qNum)=>{
	if(pageNum<1){
		throw new Error("page num cannot be less than 1!");
	}
	var start=pageNum*qNum-qNum+1;
	var end=pageNum*qNum;
	return Array.from({length: qNum}, (_, i) => i + pageNum*qNum-qNum+1);
}

getProblemsRangeOnCurrentPage(4,20);