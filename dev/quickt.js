/**
 * Quickt - Quick Templating Library for HTML
 * Freeware by Stinte Ltd
 * 
 * Version info:
 * 0.1 Preliminary code
 * 1.0 Initial release, able to render the whole page once.
 * 1.1 Function 'parse' may be called again to update contents
 * 1.2 First optimisation check   
 * 1.3 Added content-url attribute              
 * 1.4 Added 'get' function
 * 1.5 Added 'post' function
 * 1.6 'get' result is text, 'post' result is object
 * 1.7 Fixed error when JSON.parse a failed request
 * 
 * Features: 
 * pre-parsing, post-parsing, show-when, hide-when, 
 * clone-with, clone-var, content-url.
 *
 * Requirements:
 * Browser with ECMAScript 6 support.
 *
 * @file    Main source code file
 * @version 1.7
 * @author  John Lowvale
 */
//DO NOT USE STRICT, 'eval' CAN'T CREATE LOCAL VARIABLES
//http://www.w3schools.com/js/js_strict.asp 
//"use strict"; 

//calling 'eval' through a reference
//makes it work in global scope
var geval = eval;

//global private vars of this library
var Indices_Or_Keys__   = {};
var Original_Nodes__    = {};

/**
 * Add feature to 'Node' object
 */
Node.prototype.insertAfter = function(New_Node,Reference_Node) {
  var Parent       = Reference_Node.parentNode;
  var Next_Sibling = Reference_Node.nextSibling;
  
  if (Next_Sibling==null)
    Parent.appendChild(New_Node);
  else
    Parent.insertBefore(New_Node,Next_Sibling);
}

/**
 * Console log shortcut
 */
function log(Var) {
  console.log(Var);
} 

/**
 * Get a cookie
 */
function get_cookie(cname) {
  var name = cname+"=";
  var ca   = document.cookie.split(';');  
  for (var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') 
      c = c.substring(1);
    if (c.indexOf(name) == 0) 
      return c.substring(name.length,c.length);
  }
  return "";
}

/**
 * Set a cookie
 */
function set_cookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname+"="+cvalue+"; "+expires;
}

/**
 * HTTP GET       
 * Callback is function(Error,Data)
 */        
function get(Url,Data,Callback) {
  var SYNC             = false;
  var ASYNC            = true;
  var UNSENT           = 0;
  var OPENED           = 1;
  var HEADERS_RECEIVED = 2;
  var LOADING          = 3;
  var DONE             = 4;  
  var OK               = 200;
  
  //new request
  var Request = new XMLHttpRequest();
   
  //connection state changed
  Request.onreadystatechange = function() {
    if (Request.readyState==DONE) {
      if (Request.status==OK)
        Callback(null,Request.responseText);
      else
        Callback(Request.status,"");  
    }
  };                              
  
  //open connection and send
  Request.open("GET",Url,ASYNC);
  Request.send();
}  

/**
 * HTTP POST       
 * Callback is function(Error,Data)
 */        
function post(Url,Data,Callback) {
  var SYNC             = false;
  var ASYNC            = true;
  var UNSENT           = 0;
  var OPENED           = 1;
  var HEADERS_RECEIVED = 2;
  var LOADING          = 3;
  var DONE             = 4;  
  var OK               = 200;
  
  //new request
  var Request = new XMLHttpRequest();
   
  //connection state changed
  Request.onreadystatechange = function() {
    if (Request.readyState==DONE) {
      if (Request.status==OK)
        Callback(null,JSON.parse(Request.responseText));
      else
        Callback(Request.status,{});  
    }
  };                              
  
  //open connection and send
  Request.open("POST",Url,ASYNC);    
  Request.setRequestHeader("Content-Type","application/json");
  Request.send(JSON.stringify(Data));
}

/**
 * Get element by id
 */
function e(Element_Id) {
  return document.getElementById(Element_Id);
} 

/**
 * Get root html element
 */
function ehtml() {
  return document.documentElement;
}

/**
 * Get body element
 */
function ebody() {
  return document.body;
} 

/**
 * Evaluate a string with template variables inside
 */
function evaluate(Template_String) {
  
  //create local variables for indices/keys values
  for (var Name in Indices_Or_Keys__) {
    var Temp = `var ${Name} = "${Indices_Or_Keys__[Name]}";`;
    eval(Temp);
  }

  //make template literal and eval
  var Template_Literal = "`"+Template_String+"`";
  return eval(Template_Literal);  
} 

/**
 * Parse attributes & texts with es6 template syntax
 */
function parse(Param) {
  var Node_Instance = {};
  if (typeof Param=="string")
    Node_Instance = Original_Nodes__[Param].cloneNode(true);
  else
    Node_Instance = Param;

  //save original node template
  if (Node_Instance.hasAttribute!=null &&
  Node_Instance.hasAttribute("id")) {
    var Id = Node_Instance.getAttribute("id");
    if (Original_Nodes__[Id]==null)
      Original_Nodes__[Id] = Node_Instance.cloneNode(true);
  }

  //local vars
  var Parent = Node_Instance.parentNode;
  var Skip   = 0;

  //element node
  if (Node_Instance.nodeType==Node.ELEMENT_NODE) {
    
    //eval before-parsing script
    if (Node_Instance.hasAttribute("pre-parsing"))
      eval(Node_Instance.getAttribute("pre-parsing"));
  
    //check attribute show-when
    if (Node_Instance.hasAttribute("show-when")) {
      var Script  = Node_Instance.getAttribute("show-when");
      var To_Show = eval(Script);
      
      if (To_Show)
        Node_Instance.removeAttribute("hidden");
      else 
        Node_Instance.setAttribute("hidden",true);
    }    
  
    //check attribute hide-when
    if (Node_Instance.hasAttribute("hide-when")) {
      var Script  = Node_Instance.getAttribute("hide-when");
      var To_Hide = eval(Script);
      
      if (To_Hide)
        Node_Instance.setAttribute("hidden",true);
      else 
        Node_Instance.removeAttribute("hidden");
    }
  
    //check attribute clone-with
    if (Node_Instance.hasAttribute("clone-with")) {
      var For_Condition = Node_Instance.getAttribute("clone-with");
      var For_Var       = Node_Instance.getAttribute("clone-var");
      var Clone_Count   = 0;
      
      //eval with template literals
      eval(`        
        var Previous_Node = Node_Instance;
        for (${For_Condition}) {
          Indices_Or_Keys__[For_Var] = eval(For_Var);
          var Clone = Node_Instance.cloneNode(true);          
          
          //make sure it won't be endless loop & no extra attribute
          Clone.removeAttribute("clone-with");
          Clone.removeAttribute("clone-var");

          //parse directly to have the indices of cloning tree
          parse(Clone); 
          
          //insert to dom document
          Parent.insertAfter(Clone,Previous_Node);
          Previous_Node = Clone;
          Clone_Count++;
        }  
      `);
      Skip = Clone_Count;
      
      //hide original node
      Node_Instance.setAttribute("hidden",true);
    }
      
    //check attribute content-url
    if (Node_Instance.hasAttribute("content-url")) {
      var Content_Url = Node_Instance.getAttribute("content-url");
      
      //get content
      get(Content_Url,{},function(Error,Data){
        if (Error!=null)
          return;          
        Node_Instance.innerHTML = Data;
        
        //parse child nodes of newly loaded content
        var Child_Nodes = Node_Instance.childNodes;
        for (var Index=0; Index<Child_Nodes.length; Index++) {
          var Child_Skip = parse(Child_Nodes[Index]);
          Index += Child_Skip;
        }
      });//get
    }
    
    //evaluate attribute values
    var Attributes = Node_Instance.getAttributeNames();
    for (var Index=0; Index<Attributes.length; Index++) {
      var Name  = Attributes[Index];
      var Value = Node_Instance.getAttribute(Name);
      Node_Instance.setAttribute(Name,evaluate(Value));
    }
  }
  else
  
  //text node
  if (Node_Instance.nodeType==Node.TEXT_NODE)
    Node_Instance.nodeValue = evaluate(Node_Instance.nodeValue);
  
  //parse child nodes too
  var Child_Nodes = Node_Instance.childNodes;
  for (var Index=0; Index<Child_Nodes.length; Index++) {
    var Child_Skip = parse(Child_Nodes[Index]);
    Index += Child_Skip;
  }
    
  //element node
  if (Node_Instance.nodeType==Node.ELEMENT_NODE) {
  
    //eval after-parsing script
    if (Node_Instance.hasAttribute("post-parsing"))
      eval(Node_Instance.getAttribute("post-parsing"));
  }
  
  //put node to showing document
  if (typeof Param=="string") {
    var Old_Node = e(Param);
    Old_Node.parentNode.insertAfter(Node_Instance,Old_Node);
    Old_Node.parentNode.removeChild(Old_Node);
  }
  
  return Skip;
} 

/**
 * Entry point of library 
 */
window.onload = function() {
  parse(ehtml());
};

//end of file