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
            setTimeout(function () {
                writeQuestion(1);
                nextQuestion();
            }, 100);

        }
    });
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
WRITE QUESTION
--------------------------------------------------*/
function writeQuestion(n) {
    question = getObjects(data, 'number', n)[0];

    // fake loading
    $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    // write question
    setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + question.intro + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setTimestamp();
        updateScrollbar();


        // if question.type is multi, i write all the checkbox
        if (question.type === 'mc') {
            setTimeout(function () {
                writeMultiAnswer(question);
            }, 500);
            $('.message-box').css({ bottom: '-40px' });
        } else if (question.type === 'open') {
            $('.message-box').css({ bottom: 0 });

            
        }


    }, random);

}


/*--------------------------------------------------
WRITE MULTIANSWER
--------------------------------------------------*/
function writeMultiAnswer(question) {

    console.log('question', question);

    $multiAnswer = $('<div><div class="multi-answer" data-number="' + question.number + '" data-response="' + question.r + '">Please, select an answer and click next button</div></div>');

    for (var i in question.possible_answers) {
        var answer = question.possible_answers[i];
        var next = question.next[i];

        $('<label><input type="checkbox" value="' + (parseInt(i) + 1) + '" data-next="' + next + '" /> <span>' + answer + '</span></label>').appendTo($('.multi-answer', $multiAnswer));
    }

    var $next = $('<a href="#" class="message-submit next">Next</a>').appendTo($('.multi-answer', $multiAnswer));

    // fake loading
    $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    // write question
    setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + $multiAnswer.html() + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setTimestamp();
        updateScrollbar();
    }, random);
}


/*--------------------------------------------------
WRITE RESPONSE
--------------------------------------------------*/
function writeResponse() {
    // $('<div class="response">' + response + '</div><hr />').appendTo('body');
}


/*--------------------------------------------------
NEXT QUESTION
--------------------------------------------------*/
function nextQuestion() {
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

            response = $p.data('response');
            number = $p.data('number');
            answers = Answers.join(',');

            console.log('number: "' + number + '", answers: "' + answers + '"');


            // --------------------------------------------------
            // Response
            // --------------------------------------------------
            // fake loading
            $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
            updateScrollbar();

            // write question
            setTimeout(function () {
                $('.message.loading').remove();
                $('<div class="message new"><figure class="avatar"><img src="' + avatar + '" /></figure>' + response + '</div>').appendTo($('.mCSB_container')).addClass('new');
                setTimestamp();
                updateScrollbar();
            }, random);
            
        }
    });
}


/*--------------------------------------------------
SEND MESSAGE
--------------------------------------------------*/
function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) === '') {
        return false;
    }
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setTimestamp();
    $('.message-input').val(null);

    // send ajax informations
    console.log(question.track);
    console.log(msg);

    // fake loading
    setTimeout(function () {
        $('<div class="message loading new"><figure class="avatar"><img src="' + avatar + '" /></figure><span></span></div>').appendTo($('.mCSB_container'));
        updateScrollbar();

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
    insertMessage();
});

$(window).on('keydown', function (e) {
    if (e.which === 13) {
        insertMessage();
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
INIT
--------------------------------------------------*/
$(window).load(function () {
    requestAjax();
    $messages.mCustomScrollbar();
    updateScrollbar();
});