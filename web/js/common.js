function insertAtCursor(myValue) {
    var myField = $("#banglaType");
    var scrollTop;
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        sel.collapse(true);
        sel.select();
    }
    else if (myField.caret().start >= 0) {
        var startPos = myField.caret().start;
        var endPos = myField.caret().end;
        scrollTop = myField.scrollTop();

        startPos = (startPos == -1 ? myField.val().length : startPos );
        myField.val(myField.val().substring(0, startPos)
                + myValue
                + myField.val().substring(endPos, myField.val().length));
        myField.focus();
        myField.caret(startPos + myValue.length, startPos + myValue.length);
        myField.scrollTop(scrollTop);
    } else {
        scrollTop = myField.scrollTop();
        myField.val(myField.val() + myValue);
        myField.focus();
        myField.scrollTop(scrollTop);
    }
}

function insertSuggestion(myValue) {
    var myField = $("#banglaType");
    var scrollTop;
    var startPos;
    var endPos;

    //insert suggestion at last
    if (myField.caret().end == myField.val().length) {

        startPos = myField.val().lastIndexOf(" ") + 1;
        scrollTop = myField.scrollTop();

        startPos = (startPos == -1 ? myField.val().length : startPos );
        myField.val(myField.val().substring(0, startPos) + myValue);
        myField.focus();
        myField.caret(myField.val().length);
        myField.scrollTop(scrollTop);
    } else {
        startPos = myField.caret().start;
        var str = myField.val().substring(0, startPos);
        startPos = str.lastIndexOf(" ") + 1;
        endPos = myField.caret().end;

        scrollTop = myField.scrollTop();

        startPos = (startPos == -1 ? myField.val().length : startPos );

        myField.val(myField.val().substring(0, startPos)
                + myValue
                + myField.val().substring(endPos, myField.val().length));

        myField.focus();
        myField.caret(startPos + myValue.length, startPos + myValue.length);
        myField.scrollTop(scrollTop);
    }
}

function replaceAllOccurrence(source, destination) {
    var myField = $("#banglaType");
    var text = myField.val();
    var texts = text.split(" ");
    var rtext = "";
    for (var i = 0; i < texts.length; i++) {
        if (texts[i] == source) {
            rtext += destination + " ";
        } else {
            rtext += texts[i] + " ";
        }
    }
    myField.val(rtext.trim());
    $("#correction_" + source).remove();
}

function showLayout(layout) {
    $("#inlinevkb").hide();
    $("#provatLayout").hide();
    $("#phoneticLayout").hide();
    $("#unijoyLayout").hide();

    if (showLayoutFlag || lastLayout != layout) {
        if (layout == 'vk') {
            $("#inlinevkb").show();
        } else if (layout == 'pl') {
            $("#provatLayout").show();
        } else if (layout == 'phl') {
            $("#phoneticLayout").show();
        } else if (layout == 'ul') {
            $("#unijoyLayout").show();
        }
        showLayoutFlag = false;
        lastLayout = layout;
    } else {
        showLayoutFlag = true;
    }
}

function getSuggestion(sugFor) {
    var sugs = new Array();
    for (i = 0; i < dictionary.length; i++) {
        if (dictionary[i].substring(0, sugFor.length) == sugFor) {
            sugs.push(dictionary[i]);
        }
    }
    return sugs;
}

function moveNext(obj, lastIndex) {
    var cp = obj.id.substring(obj.id.lastIndexOf("_") + 1, obj.id.length);
    var nextPosition = parseInt(cp);
    //down
    if (pressedKeyCode == 40 && nextPosition + 1 <= lastIndex) {
        nextPosition ++;
    }
    //up
    else if (pressedKeyCode == 38 && nextPosition - 1 >= 1) {
        nextPosition --;
    }

    $("#suggestion_" + nextPosition).focus();
}
function enablePhonetic() {
    $(".bangla").bnKb(
    {'switchkey': {"webkit":"k","mozilla":"y","safari":"k","chrome":"k","msie":"y"},
        'driver': phonetic, 'showSuggestions': {"flag":true, "div":"suggestions"}});
}

function enableProbhat() {
    $(".bangla").bnKb(
    {'switchkey': {"webkit":"k","mozilla":"y","safari":"k","chrome":"k","msie":"y"},
        'driver': probhat});
}

function enableUnijoy() {
    $(".bangla").bnKb(
    {'switchkey': {"webkit":"k","mozilla":"y","safari":"k","chrome":"k","msie":"y"},
        'driver': unijoy});
}

function trainSpellChecker() {
    $.loading(true, { text: 'Working on training ...', pulse: 'fade'});
    var t0 = new Date();
    $.get("/web/resource/banglabig.txt", null, function (data, textStatus) {
        var t1 = new Date();
        var lines = data.split("\n");
        var count = lines.length;
        lines.forEach(function (line) {
            setTimeout(function () {
                speller.train(line);
                count--;
                if (count == 0) {
                    var t2 = new Date();
                    $.loading(false, { text: 'Working on training...', pulse: 'fade'});
                }
            }, 0);
        });
    }, "text");
}
function checkSpelling() {

    $.loading(true, { text: 'Working on spell ...', pulse: 'fade'});
    var text = $('#banglaType')[0].value;
    var corrections = "";
    var texts = text.split(" ");
    for (var i = 0; i < texts.length; i++) {
        var word = texts[i].trim();


        if (dictionary.indexOf(word) < 0) {
            var cword = speller.correct(word);
            if (cword == word) continue;
            corrections += '<a class="suggestion"  id="correction_' + word + '" href="#" onclick="replaceAllOccurrence(\'' + word + '\',\'' + cword + '\');">' + (word + '-> ' + cword) + "</a><br>";
        }

    }
    if (corrections.length <= 0) {
        corrections = "No Corrections";
    } else {
        corrections = "Corrections<br>" + corrections;
    }
    $("#suggestions").html(corrections);
    $.loading(false, { text: 'Working on spell ...', pulse: 'fade'});


}