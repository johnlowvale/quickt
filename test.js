
//global vars
var Hello_World = "";
var Show_Flag_1 = true;
var Show_Flag_2 = true;
var Test_Array  = [0,1,2,3,4,5,6,7,8,9];
var Test_Object = {
  test1:"0123456789",
  test2:"abcdefghijklmnopqrstuvwxyz"
};

//toggle content 1
function toggle_content_1() {
  Show_Flag_1 = !Show_Flag_1;
  parse("Content-1");
}

//toggle content 2
function toggle_content_2() {
  Show_Flag_2 = !Show_Flag_2;
  parse("Content-2");
}

//shift entries in Test_Array
function shift_test_array() {
  var First  = Test_Array.splice(0,1);
  var Length = Test_Array.length;
  Test_Array[Length] = First;
  parse("Test-Array-Holder");
}

//swap properties in Test_Object
function swap_test_object() {
  var Temp = Test_Object.test1;
  Test_Object.test1 = Test_Object.test2;
  Test_Object.test2 = Temp;
  parse("Test-Object-Holder");
}

//before Hasher does parsing html document
function init() {
  Hello_World = "Hello, World!";
  Show_Flag_1 = true;
  Show_Flag_2 = true;
}

//after Hasher completed parsing
function done() {
  alert(evaluate("${Hello_World}"));
}

//end of file