/*--------------------------------------------------
GLOBAL VARS
--------------------------------------------------*/
var data,
    question,
    response,
    next,
    $messages = $('.messages-content'),
    date,
    minutes,
    user,
    questionnaire,
    i = 0,
    avatar = 'http://mobpro.com/assets/favicon-96x96.png',
    random = 1000 + (Math.random() * 20) * 100;


/*--------------------------------------------------
REQUEST AJAX QUESTIONS
--------------------------------------------------*/
function requestAjax() {

    $.ajax({
        url: 'questions.json',
        dataType: 'json',
        cache: false,
        success: function (d) {
            data = d;
            user = data[0].user;
            questionnaire = data[0].questionnaire;

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
        minutes = date.getMinutes();
        $('<div class="timestamp">' + date.getHours() + ':' + minutes + '</div>').appendTo($('.message:last'));
    }
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
FAKE LOADING
--------------------------------------------------*/
function fakeLoading() {
    $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();
}


/*--------------------------------------------------
INIT
--------------------------------------------------*/
$(window).load(function () {
    requestAjax();
    $messages.mCustomScrollbar();
    updateScrollbar();
});