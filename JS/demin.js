var obj = {"widget": { "debug": "on", "window": { "title": "Sample Konfabulator Widget", "name": "main_window", "width": 500, "height": 500 }, "image": { "src": "Images/Sun.png", "name": "sun1", "hOffset": 250, "vOffset": 250, "alignment": "center" }, "text": { "data": "Click Here", "size": 36, "style": "bold", "name": "text1", "hOffset": 250, "vOffset": 100, "alignment": "center", "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;" } }};

function CodeArray(obj) {
    this.items = [];
    this.json = obj;
}

CodeArray.prototype = {
    createHtml: function (json) {
        var tierNum = 0, id = 0, self = this, str = "";
        this.items.length = 0;

        // id corresponds the markup element id
        function addElement(html, id) {
            var element = {}
            element.html = html;
            element.id = id;
            self.items.push(element);
        }
        // TODO: use J templates to add the html into addElement???
        // TODO: fix bug related to variable font width, and bug where if you send it a number it set input size the size is undefined
        function traverse(o) {
            id++;
            tierNum != 0 ? addElement("<li><div class='del'>x</div><ul class=t" + tierNum + " id=" + id + ">", id)
                : addElement("<ul class=t" + tierNum + " id=" + id + ">", id);
            for (var key in o) {
                if (typeof o[key] === "object") {
                    if (isNaN(key)) { addElement("<li class='item'><input type='text' class='key' value=" + key + " size=" + key.toString().length + ">:<div class='delO'>x</div> </li>", id); }
                    tierNum++;
                    traverse(o[key]);
                    tierNum--;
                } else {
                    addElement("<li class='item'><input type='text' class='key' value='" + key + "' size=" + key.toString().length + "> : <input type='text' class='val' value='"
                        + o[key] + "' size=" + o[key].length + "><div class='del'>x</div><div class='save'> &#10003; </div></li>", id);
                }
            }
            tierNum != 0 ? addElement("</ul></li>", id) : addElement("</ul>", id);
        }
        traverse(json);
        updateResultsContainer(this.items);
        $("#textJson textarea").text(JSON.stringify(this.json));
    },

    print: function () {
        for (var i = 0; i < this.items.length; i++) {
            //console.log(this.items[i].id + " " + this.items[i].html);
        }
    },

    deleteItems: function (toDelete) {

        var keys = toDelete.find(".key");
        var vals = toDelete.find(".val");

        function removeKV(delKey, delVal, o) {
            for (var key in o) {
                if (typeof o[key] === "object") {
                    if (removeKV(delKey, delVal, o[key])) { return true; }
                } else {
                    if (delKey == key && delVal == o[key]) {
                        delete o[key];
                        return true;
                    }
                }
            }
        }

        function removeList(delKey, o) {
            for (var key in o) {
                if (key == delKey) {
                    delete o[key];
                    return true;
                }
                if (typeof (o[key]) === "object") {
                    if (removeList(delKey, o[key])) { return true; }
                }
            }
        }

        if (vals[0] === undefined) {
            removeList(keys[0].value, this.json);
        } else {
            for (var i = 0; i < keys.length; i++) {
                removeKV(keys[i].value, vals[i].value, this.json);
            }
        }

        this.createHtml(this.json);
    },

    save: function (toSave) {
        alert("Sorry this does not do anything yet");
    }
}

function getRequest(inputLocation) {
    $.ajax({
        type: "GET",
        url: inputLocation,
        contentType: "application/json",
        dataType: "jsonp",
        success: function (data) {
            toPretty.createHtml(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $("#resultsContainer").html("Oops, something went wrong. I hope this helps... xhr.statusText: " +
                xhr.statusText + " ajaxOptions: " + ajaxOptions + " thrownError: " + thrownError);
        }
    });
}

function updateResultsContainer(array) {
    var i, html = "", whiteBorder = { "border-bottom-color": "White" }, 
    blackBorder = { "border-bottom-color": "Black" }, interactiveJson = $("#interactiveJson");
    
    for (i = 0; i < array.length; i = i + 1) { //TODO: no immutable in a loop
        if (array[i].html !== undefined) { html += array[i].html; }
    }

    // TODO: clean up all these listeners
    $("#interactiveBtn").css(whiteBorder);
    interactiveJson.html(html);
    
    $("#interactiveBtn").click(function () {
        $(this).css(whiteBorder);
        $("#directBtn").css(blackBorder);
        $("#textJson").hide();
        interactiveJson.show();
    });

    $("#directBtn").click(function () {
        $(this).css(whiteBorder);
        $("#interactiveBtn").css(blackBorder);
        interactiveJson.hide();
        $("#textJson").show();
    });

    $(".del").click(function (e) {
        e.stopPropagation();
        toPretty.deleteItems($(this).parent());
    });
    $(".delO").click(function (e) {
        e.stopPropagation();
        toPretty.deleteItems($(this).parent());
    });

    $(".save").click(function (e) {
        e.stopPropagation();
        toPretty.save($(this).parent());
    });

    $(".t0, .t1, .t2").click(function (e) {
        e.stopPropagation();
        $(this).hasClass("min") ? $(this).removeClass("min") : $(this).addClass("min");
        $(this).children().slideToggle();
    });
}

var toPretty = new CodeArray(obj);

(function () {
    // Navigation listeners
    $("#loadStock").click(function () {
        toPretty.createHtml(obj);
        $("#getInput").hide();
        $("#textInput").hide();
    });
    $("#loadGet").click(function () { $("#getInput").show(); });
    $("#loadInput").click(function () { $("#textInput").show(); });
    $("#print").click(function () { toPretty.print(); });
    $("#keyVal").click(function () { toPretty.getKeyVal(); });
    $("#help").click(function () {
        var i, htmlString = [];
        htmlString.push("<div class='help'>HELP</div>");
        for (i = 0; i < 100; i++) {
            htmlString.push("<div class='line'></div>");
        }
        $("#resultsContainer").html(htmlString.join(""));
    });
})();
