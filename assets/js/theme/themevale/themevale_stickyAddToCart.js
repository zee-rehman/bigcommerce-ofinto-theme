import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import swal from 'sweetalert2';
import _ from 'lodash'; 

export default function(){
    if ($('#form-action-addToCart').length) {
        var scroll = $('#form-action-addToCart').offset();
        var scrollTop = scroll.top;
        var heightHeader = $('.header').height();

		$(window).on('load resize', function() {
			const $mobileBottomBar = $('#sticky_addtocart .product-info');
			const $mobileBottomBarHeight = $mobileBottomBar.outerHeight(true);

			if ($mobileBottomBar.length) {
				$('#sticky_addtocart').css('--mobile-bar-height', `${$mobileBottomBarHeight}px`);
			}
		})

        $(window).scroll(function(){
            if($(window).scrollTop() > scrollTop){
                if(!$('#sticky_addtocart').hasClass('show_sticky')){
                    $('#sticky_addtocart').addClass('show_sticky');
                    if ($('.header').hasClass('is-sticky')) {
                        $('#sticky_addtocart').css('top', heightHeader);
                    } else {
                        $('#sticky_addtocart').css('top', '0px');
                    }
                }
            } else{
                $('#sticky_addtocart').removeClass('show_sticky');
                $('.pop-up-option').removeClass('is-open');
                $('.choose_options_add').removeClass('is-active');
            }
        });

        $(document).on('click','.choose_options_add', function(event){
            $(this).toggleClass('is-active');
            $('.pop-up-option').toggleClass('is-open');

			if ($('.pop-up-option').hasClass('is-open')) {
				setTimeout(() => {
					$('.pop-up-option').addClass('is-animated');
				}, 600);
			} else {
				$('.pop-up-option').removeClass('is-animated');
			}

            $('.card').find('.quickShopPopup .quickShopWrap').remove();
            $('.card').find('.card-figure').removeClass('has-popup');
        });

        $(document).on('click','.pop-up-option .close', function(event){
            $(".pop-up-option").removeClass('is-open');
            $('.choose_options_add').removeClass('is-active');
        });

        window.onload = function(){
            if($(window).scrollTop() > scrollTop){
                if(!$('#sticky_addtocart').hasClass('show_sticky')){
                    $('#sticky_addtocart').addClass('show_sticky');
                    if ($('.header').hasClass('is-sticky')) {
                        $('#sticky_addtocart').css('top', heightHeader);
                    } else {
                        $('#sticky_addtocart').css('top', '0px');
                    }
                }
            }
        }

        const addToCartWrapper = $('#add-to-cart-wrapper');

        addToCartWrapper.show();
    }
    
}