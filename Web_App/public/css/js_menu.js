/* 
   Simple JQuery Accordion menu.
   HTML structure to use:

   <ul id="menu">
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     ...
     ...
   </ul>

Copyright 2007 by Marco van Hylckama Vlieg

web: http://www.i-marco.nl/weblog/
email: marco@i-marco.nl

Free for non-commercial use
*/

function ResetClass() {
    var menu = document.getElementById("menu");
    var arrA = menu.getElementsByTagName("a");
    for (i = 0; i < arrA.length; i++) {
        var linkItem = arrA[i];
        if ($(linkItem).attr("rel") != "1") {
            linkItem.className = "";
        }
        
    }
}


function initMenu() {
    try {

        $("#menu ul").hide();
        //$('#menu ul:first').show();
        var currentPage;
        try{
         currentPage = document.getElementsByName("dse_operationName").item(0).attributes["value"].nodeValue;
        } catch (e) {
        	currentPage = "noCheckMenu";
        }
        
        $("#menu li a").each(function () {
            if ($(this).attr("href").indexOf(currentPage) != -1) {
                
                $(this).addClass("selected");
                $(this).attr("rel", "1");

                var root = $(this).parent().parent().parent();
                if (root.length > 0) {
                    root.children("a").addClass("selected");
                    root.children("a").attr("rel", "1");

                    root.children("ul").slideDown("normal", function () {
                        setBoxHeight();
                    });

                    var root2 = root.parent().parent();

                    if (root2.length > 0) {
                        root2.children("a").addClass("selected");
                        root2.children("a").attr("rel", "1");

                        root2.children("ul").slideDown("normal", function () {
                            setBoxHeight();
                        });
                    }

                }
                else
                {
                    $(this).parent().children("ul").slideDown("normal");

                }

                return false;
            }
        });

        

        if ($(".main-right").height() > $(".main-left").height() && $(".main-right").height() > parseInt($(".main-left").css("min-height"))) {
            $(".main-left").css("min-height", $(".main-right").height()-100 + "px");

            setBoxHeight();
        }

    } catch (e) {

    }

    

    $("#menu > li > a").click(
      function () {
          ResetClass();
          this.className = "selected";
          var checkElement = $(this).next();
          if ((checkElement.is("ul")) && (checkElement.is(":visible"))) {
              return false;
          }
          if ((checkElement.is("ul")) && (!checkElement.is(":visible"))) {
              $("#menu ul:visible").slideUp("normal");
              checkElement.slideDown("normal", function () {
                  setBoxHeight();
              });
              return false;
          }
      }
      );

    $("#menu > li > ul > li > a").click(
      function () {
          ResetClass();
          this.className = "selected";
          var checkElement = $(this).next();
          if ((checkElement.is("ul")) && (checkElement.is(":visible"))) {
              return false;
          }
          if ((checkElement.is("ul")) && (!checkElement.is(":visible"))) {
              $("#menu ul li ul:visible").slideUp("normal");
              checkElement.slideDown("normal", function () {
                  setBoxHeight();
              });
              return false;
          }
      }
      );
}


$(document).ready(function () { initMenu(); });

function setBoxHeight() {
    var boxHeight = parseInt($(".main-left").css("minHeight")) - $("#menu").height();

    if ($(".main-left").height() > $(".main-right").height()) {
        boxHeight -= 100;
    }

    if (boxHeight < 300) {
        boxHeight = 300;
    }

    $(".main-left .box-left").css({ minHeight: boxHeight + "px" });
}
