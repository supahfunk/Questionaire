/*--------------------------------------------------
DOC COOKIES
--------------------------------------------------*/
var docCookies = {
    getItem: function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};


/*--------------------------------------------------
GLOBAL VARS
--------------------------------------------------*/
var questionnaire = getQueryParams('file') || 'questions',
    user = checkUser(),
    avatar = 'http://mobpro.com/assets/favicon-96x96.png',
    $messages = $('.messages-content'),
    random = 1000 + (Math.random() * 20) * 100,
    data,
    question,
    response,
    next,
    date,
    minutes;


/*--------------------------------------------------
REQUEST AJAX QUESTIONS
--------------------------------------------------*/
function requestAjax() {

    $.ajax({
        url: questionnaire + '.json',
        dataType: 'json',
        cache: false,
        success: function (d) {
            data = d;

            setTimeout(function () {
                writeQuestion(1);
                nextButton();
            }, 100);

        }
    });
}


/*--------------------------------------------------
WRITE QUESTION
--------------------------------------------------*/
function writeQuestion(n) {
    if (n === 0) {
        $('.message-box').css({ bottom: '-40px' });
        return false;
    }

    question = getObjects(data, 'number', n)[0];

    fakeLoading();

    // write question
    setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + question.intro + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setTimestamp();
        updateScrollbar();

        if (question.type === 'checkbox' || question.type === 'radio') {
            setTimeout(function () {
                writeMultiAnswer(question, question.type);
            }, 500);
            $('.message-box').css({ bottom: '-40px' });
        } else if (question.type === 'open') {
            $('.message-box').removeClass('disabled');
            $('.message-box').css({ bottom: 0 });
        }

    }, random);

}


/*--------------------------------------------------
WRITE MULTIANSWER
--------------------------------------------------*/
function writeMultiAnswer(question, type) {

    console.log('question', question);

    $multiAnswer = $('<div><div class="multi-answer ' + type + '" data-number="' + question.number + '" data-response="' + question.r + '"  data-track="' + question.track + '">Please, select an answer and click next button</div></div>');

    for (var i in question.possible_answers) {
        var answer = question.possible_answers[i];
        var next = question.next[i] || question.next;
        var number = question.number;

        $('<label><input name="question-' + number + '" type="' + type + '" value="' + (parseInt(i) + 1) + '" data-next="' + next + '" /> <span>' + answer + '</span></label>').appendTo($('.multi-answer', $multiAnswer));
    }

    var $next = $('<a href="#" class="message-submit next">Next</a>').appendTo($('.multi-answer', $multiAnswer));

    fakeLoading();

    // write question
    setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + $multiAnswer.html() + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setTimestamp();
        updateScrollbar();
    }, random);
}


/*--------------------------------------------------
NEXT BUTTON
--------------------------------------------------*/
function nextButton() {
    $('.chat').on('click', '.next', function () {
        $p = $(this).parent();
        if ($(':checked', $p).size() === 0) {
            $(this).after('<small>Please check almost one answer</small>');
        } else {
            $('small', $p).remove();
            $p.addClass('disabled');

            Answers = [];

            $(':checked', $p).each(function () {
                Answers.push($(this).next().text());
            });

            next = $(':checked', $p).eq(0).data('next');
            response = $p.data('response');
            number = $p.data('number');
            track = $p.data('track');
            answers = Answers.join(',');

            sendInfo = {
                "user": user,
                "questionnaire": questionnaire,
                "number": number,
                "answer": answers
            }

            $.ajax({
                type: "POST",
                url: track,
                dataType: "json",
                success: function (msg) {
                },
                data: sendInfo
            });


            // --------------------------------------------------
            // Response
            // --------------------------------------------------
            fakeLoading();

            // write question
            setTimeout(function () {
                $('.message.loading').remove();
                $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + response + '</div>').appendTo($('.mCSB_container')).addClass('new');
                setTimestamp();
                updateScrollbar();


                setTimeout(function () {
                    writeQuestion(next);
                }, random);

            }, random);

        }
    });
}


/*--------------------------------------------------
SEND MESSAGE
--------------------------------------------------*/
function sendMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) === '') {
        return false;
    }
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setTimestamp();
    $('.message-input').val(null);
    $('.message-box').addClass('disabled');

    // send ajax informations
    sendInfo = {
        "user": user,
        "questionnaire": questionnaire,
        "number": question.number,
        "answer": msg.replace(/"/g, '\\"')
    }

    $.ajax({
        type: "POST",
        url: question.track,
        dataType: "json",
        success: function (msg) {
        },
        data: sendInfo
    });


    setTimeout(function () {
        fakeLoading();

        setTimeout(function () {
            $('.message.loading').remove();
            $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + question.r + '</div>').appendTo($('.mCSB_container')).addClass('new');
            setTimestamp();
            updateScrollbar();

            setTimeout(function () {
                writeQuestion(question.next);
            }, random);

        }, random);

    }, random);
}
$('.message-submit').on('click', function () {
    sendMessage();
});
$(window).on('keydown', function (e) {
    if (e.which === 13) {
        sendMessage();
        return false;
    }
})


/*--------------------------------------------------
UPDATE SCROLLBAR
--------------------------------------------------*/
function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}


/*--------------------------------------------------
SET TIMESTAMP
--------------------------------------------------*/
function setTimestamp() {
    date = new Date()
    if (minutes !== date.getMinutes()) {
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        $('<div class="timestamp">' + date.getHours() + ':' + minutes + '</div>').appendTo($('.message:last'));
    }
}


/*--------------------------------------------------
FAKE LOADING
--------------------------------------------------*/
function fakeLoading() {
    $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();
}



/*--------------------------------------------------
ZOOM IMAGE
--------------------------------------------------*/
function zoomImage() {
    $('.chat').on('click', '.message > img', function () {
        $zoom = $('<div class="zoom" />').hide().appendTo('.chat');
        $(this).clone().appendTo($zoom);
        $zoom.fadeIn(500);
    });

    $('.chat').on('click', '.zoom', function () {
        $('.zoom').fadeOut(500, function () {
            $(this).remove();
        });
    });
}


/*--------------------------------------------------
CHECK USER
--------------------------------------------------*/
function checkUser() {

    user = getQueryParams('mpid') || docCookies.getItem('user') || guid();

    var CookieDate = new Date;
    CookieDate.setFullYear(CookieDate.getFullYear() + 1);
    docCookies.setItem('user', user, CookieDate.toGMTString());
    return user;
}


/*--------------------------------------------------
GENERATE USER ID
--------------------------------------------------*/
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    user = s4() + s4() + s4();
    
    return user;
}


/*--------------------------------------------------
GET OBJECTS
--------------------------------------------------*/
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}


/*--------------------------------------------------
GET QUERY PARAMS
--------------------------------------------------*/
function getQueryParams(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


/*--------------------------------------------------
INIT
--------------------------------------------------*/
$(window).load(function () {
    requestAjax();
    $messages.mCustomScrollbar();
    updateScrollbar();
    zoomImage();
});


/*--------------------------------------------------
WIN RESIZE
--------------------------------------------------*/
$(window).resize(function () {
    updateScrollbar();
});