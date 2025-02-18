import $ from 'jquery';

export default function() {
    if ($(window).width() < 551) {
        if ($('.category-filter').length) {
            var scroll = $('.category-filter').offset();
            var scrollTop = scroll.top;
            var heightHeader = $('.header').height();

            $(window).scroll(function(){
                if($(window).scrollTop() > scrollTop){
                    if(!$('.category-filter').hasClass('show_sticky')){
                        $('.category-filter').addClass('show_sticky');
                        if ($('.header').hasClass('is-sticky')) {
                            $('.category-filter').css('top', heightHeader);
                        } else {
                            $('.category-filter').css('top', '0px');
                        }
                    }
                } else{
                    $('.category-filter').removeClass('show_sticky');
                }
            });

            window.onload = function(){
                if($(window).scrollTop() > scrollTop){
                    if(!$('.category-filter').hasClass('show_sticky')){
                        $('.category-filter').addClass('show_sticky');
                        if ($('.header').hasClass('is-sticky')) {
                            $('.category-filter').css('top', heightHeader);
                        } else {
                            $('.category-filter').css('top', '0px');
                        }
                    }
                }
            }
        }
    }
}
