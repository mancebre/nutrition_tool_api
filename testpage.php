<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>jQuery.post demo</title>
  <script src="//code.jquery.com/jquery-1.10.2.js"></script>
</head>
<body>
 
<form action="/" id="searchForm">
  <textarea id="rec"></textarea>
  <input type="submit" value="Search">
</form>
<!-- the result of the search will be rendered inside this div -->
<div id="result"></div>
 
<script>
// Attach a submit handler to the form
$( "#searchForm" ).submit(function( event ) {
 
  // Stop form from submitting normally
  event.preventDefault();
 
  // Get some values from elements on the page:
  var $form = $( this ),
    term = $("#rec").val();
    url = 'http://104.131.17.237:8080/api/testing';
 
jQuery.ajax(

{

url : url,

type: 'POST',

dataType : "json",

data: {ingredients: term},

success:function(data) {
  jQuery.each( data, function( i, val ) {
    console.log(val);
  });
},

error: function() {alert(data); }

}

);
});
</script>
 
</body>
</html>