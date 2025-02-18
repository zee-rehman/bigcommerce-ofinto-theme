import $ from 'jquery';

export default function() {
	function header_sticky() {
        // Add class fixed for menu when scroll
        var header_position;
        header_position = $('.header').height();

        $(window).on('scroll', function(event) {
            var scroll = $(window).scrollTop();
            if (scroll > header_position) {
                $('header').addClass('is-sticky');
                $('body').css('padding-top', header_position);
            } else {
                $('header').removeClass('is-sticky');
                $('body').css('padding-top', 0);
            }
        });
        window.onload = function() {
            if ($(window).scrollTop() > header_position) {
                $('header').addClass('is-sticky');
                $('body').css('padding-top', header_position);
            }
        };
    }
    header_sticky();
}
