import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import jqueryCookie from 'jquery.cookie';
import Pace from 'pace';
import classie from 'classie';
import 'jquery-mousewheel';
import 'fancybox';
import _ from 'lodash';
import mediaQueryListFactory from '../common/media-query-list';
import haloAddOptionForProduct from './themevale_AddOptionForProduct';
const mediumMedia = mediaQueryListFactory('medium');

export default function(context) {
    function variantImageColor(){
        $(document).on('click', '.card .card-option .form-option', function(){
        var self = $(this),
            newImageVariant = self.data('image'),
            productItemElm = self.closest('.card');

            self.parents('.card-option').find('.form-option').removeClass('active');
            self.addClass('active');
            
            if (newImageVariant != "undefined") {
                productItemElm.find('.card-img-container > img').attr({
                    "srcset": newImageVariant,
                    "src": newImageVariant
                });
                return false;
            }
        });
    }
    variantImageColor();
    
    function navPagesDropdown() {
        if ($(window).width() > 1024) {
            const $navigation = $('#navPages-list-main');
            const $navigationItemCustom = $navigation.children('.navPages-item-custom');
            const $navigationDropdown = $('.navPages >.navPages-list:not(.navPages-list--user) >.navPages-item-custom >.navPage-subMenu >.container >.navPage-subMenu-list');
            const $navPagesContainer = $('.navPages-container');
            
            const resize = () => {
                $navPagesContainer.removeClass('initialized');

                if (!$navigationItemCustom.is('.u-hiddenVisually')) {
                    $navigationItemCustom.before($navigationDropdown.children());
                    $navigationItemCustom.addClass('u-hiddenVisually');
                }

                if (!mediumMedia.matches) {
                    return;
                }
                do { // eslint-disable-line
                    const $lastItem = $navigation.children('.navPages-item').not(':last-child').last();
                    const lastItemRight = Math.round($lastItem.offset().left - $navigation.offset().left + $lastItem.width());
                    const mainWidth = Math.round($navigation.width());

                    if ($navigationDropdown.children().length > 0) {
                        const toggleRight = Math.round($navigationItemCustom.offset().left - $navigation.offset().left + $navigationItemCustom.width());
                        if (toggleRight > mainWidth) {
                            $navigationDropdown.prepend($lastItem);
                        } else {
                            break;
                        }
                    } else if (lastItemRight > mainWidth) {
                        $navigationDropdown.prepend($lastItem);
                        $navigationItemCustom.removeClass('u-hiddenVisually');
                    } else {
                        break;
                    }
                } while (true);

                $navPagesContainer.addClass('initialized');
            };

            $(window).on('resize', _.debounce(resize, 200));
            resize();

            if ($('.themevale-header-layout-1').length) {
                $('.themevale_header .header-left').addClass('custom');
            } else {
                $('.themevale_header .header-center').addClass('custom');
            }
        }
    }
    // navPagesDropdown(); // This function not longer available because we are appearing menu from Json file dynamically
    
    /* Custom Block Search  */
    var searchTrending = context.themeSettings.enable_search_trending;
    var searchProductBlock = context.themeSettings.enable_search_product_block;

    function focusSearchInput() {
        if ($('.themevale-header-layout-1').length) {
            jQuery(document).on('click', '.navUser-item--quichSearch .form .form-input',  function(e){
                e.preventDefault();
                e.stopPropagation();
                if ($('.navUser-item--quichSearch .dropdown--quickSearch').length <= 0) {
                    $('.before-you-leave-tab .search .dropdown--quickSearch').appendTo('.navUser-item--quichSearch');
                }
                $('.dropdown--quickSearch').addClass('show-result');
                $('.quickSearchResults').removeClass('show-result');
                $(this).closest('.navUser-item--quichSearch').find('.header-search-wrap').addClass('show-result');
                $('.navUser-item--quichSearch').addClass('show-result');
                searchProductsBlock();
                $('.navUser-item--account .account-dropdown').slideUp();
                $('.navUser-section--currency .navUser-action--currencySelector').removeClass('is-open');
                $('.navUser-section--currency #currencySelection').removeClass('is-open');
                $('body').removeClass('themevale-open-cart');

                if ($('body').hasClass('open_beforeYouLeave')) {
                    $('body').removeClass('open_beforeYouLeave');
                }
            });
        } else {
            if ($(window).width() > 1024) {
                $('.themevale-header-layout-2 .navUser-item--quichSearch .navUser-action--search').on('click', function(ev) {
                    ev.preventDefault();
                    searchProductsBlock();
                    var heightHeader = $('.header').height();
					var heightAnnouncementBar = $('.announcementBar-wrapper .announcementBar').height();
						heightAnnouncementBar = heightHeader + heightAnnouncementBar - 2;
					if($('.announcementBar-wrapper .announcementBar').length > 0) {
						$('.themevaleSearch').css('top',heightAnnouncementBar);
					} else {
						$('.themevaleSearch').css('top',heightHeader);
					}
                    $('.header-search-wrap').addClass('show-result');
                    $('body').toggleClass('themevale-open-search');
                    $('.navUser-item--account .account-dropdown').slideUp();
                    $('body').removeClass('themevale-open-cart');

                    if ($('.navUser-item--quichSearch .themevaleSearch .dropdown--quickSearch').length <= 0) {
                        $('.before-you-leave-tab .search .dropdown--quickSearch').appendTo('.navUser-item--quichSearch .themevaleSearch');
                    }
                    if ($('body').hasClass('open_beforeYouLeave')) {
                        $('body').removeClass('open_beforeYouLeave');
                    }
                });
                
                $(document).on('click', function(ev) {
                    if ($(ev.target).closest('.themevale-header-layout-2 .navUser-item--quichSearch').length === 0 && $(ev.target).closest('.themevale-header-layout-2 .navUser-item--quichSearch .navUser-action--search').length === 0) {
                        $('body').removeClass('themevale-open-search');
                    }
                });
                
            } else {
                $('.header-layout-2 .item--searchMobile .searchMobile').on('click', function(ev) {
                    ev.preventDefault();
                    searchProductsBlock();
                    $('.header-search-wrap').addClass('show-result');
                    $('body').toggleClass('themevale-open-search');

                    if ($('#searchMobile .themevaleSearch .dropdown--quickSearch').length <= 0) {
                        $('.before-you-leave-tab .search .dropdown--quickSearch').appendTo('#searchMobile .themevaleSearch');
                    }
                });

                $('.header-layout-2 #search-mobile .themevale_close').on('click', function(e) {
                    $('body').removeClass('themevale-open-search');
                });
                
                if ($('body').hasClass('open_beforeYouLeave')) {
                    $('body').removeClass('open_beforeYouLeave');
                }

                $('.themevale_background').on('click', function(e) {
                    if ($('body').hasClass('themevale-open-search')) {
                        $('body').removeClass('themevale-open-search');
                    }
                });
            }       
        }

        $(document).mouseup(function (e) {
            var container = $(".navUser-item--quichSearch");

            if (!container.is(e.target) && container.has(e.target).length === 0){
                container.find('.header-search-wrap').removeClass('show-result');
                $('.dropdown--quickSearch').removeClass('show-result');
                container.removeClass('show-result');
            }
        });

        // search on Before You Leave
        $('.before-you-leave-tab .search .search-icon .icon-search').on('click', function(ev) {
            ev.preventDefault();
            $(this).parent().addClass('is-open');
        });
        $('.before-you-leave-tab .search .search-icon .icon-close').on('click', function(ev) {
            ev.preventDefault();
            $(this).parent().removeClass('is-open');
            var container = $(".before-you-leave-tab .search");
            container.find('.header-search-wrap').removeClass('show-result');
            container.find('.dropdown--quickSearch').removeClass('is-open');
        });

        jQuery(document).on('click', '.before-you-leave-tab .search .form .form-input',  function(e){
            e.preventDefault();
            e.stopPropagation();
            if ($('.themevale-header-layout-1').length) {
                if ($('.before-you-leave-tab .search .dropdown--quickSearch').length <= 0) {
                    $('.navUser-item--quichSearch .dropdown--quickSearch').appendTo('.before-you-leave-tab .search');
                }
            } else {
                if ($(window).width() > 1024) {
                    if ($('.before-you-leave-tab .search .dropdown--quickSearch').length <= 0) {
                        $('.navUser-item--quichSearch .dropdown--quickSearch').appendTo('.before-you-leave-tab .search');
                    }
                } else {
                    if ($('.before-you-leave-tab .search .dropdown--quickSearch').length <= 0) {
                        $('#searchMobile .themevaleSearch .dropdown--quickSearch').appendTo('.before-you-leave-tab .search');
                    }
                }
            }
            
            $(this).closest('.before-you-leave-tab .search').find('.dropdown--quickSearch').addClass('is-open');
            $(this).closest('.before-you-leave-tab .search').find('.quickSearchResults').removeClass('show-result');
            $(this).closest('.before-you-leave-tab .search').find('.header-search-wrap').addClass('show-result');
            searchProductsBlock();
        });

        $(document).mouseup(function (e) {
            var container = $(".before-you-leave-tab .search");

            if (!container.is(e.target) && container.has(e.target).length === 0){
                container.find('.header-search-wrap').removeClass('show-result');
                container.find('.dropdown--quickSearch').removeClass('is-open');
            }
        });
    }
	

    if (searchTrending || searchProductBlock) {
        focusSearchInput();
    }
    
	// This function not longer available because we are appearing menu from Json file dynamically for mobile as well
	//function activeMenu_Mobile() {
//        if ($(window).width() <= 1024) {
//            if ($('#menu .navPages').length) {
//                $('#menu .navPages').appendTo('#menuMobile');
//            }            
//        } else {
//            if (!$('#menu .navPages').length) {
//                $('#menuMobile .navPages').appendTo('#menu');
//            }
//        }
//    }
	
	//function activeMenu_Mobile() {
        //if ($('.mega-menu .nav-items').length) {
			//$('.mega-menu .nav-items').clone().appendTo('#menuMobile');
		//}
    //}
    // activeMenu_Mobile();

    function toggleAccount() {
        $('.navUser-item--account .navUser-action--account').on('click', function(ev) {
            ev.preventDefault();
            $('.navUser-item--account .account-dropdown').slideToggle();
            $('body').removeClass('themevale-open-cart');
            $('.themevale-header-layout-2 .navUser-item--quichSearch form').slideUp();
            if ($('body').hasClass('open_beforeYouLeave')) {
                $('body').removeClass('open_beforeYouLeave');
            }
        })

        $('.navUser-item--account .navPage-subMenu-title .icon').on('click', function(ev) {
            $('.navUser-item--account .account-dropdown').slideUp();
        });

        $(document).on('click', function(ev) {
            if ($(ev.target).closest('.navUser-item--account').length === 0 && $(ev.target).closest('.navUser-item--account .navUser-action--account').length === 0) {
                $('.navUser-item--account .account-dropdown').slideUp();
            }
        })

        if ($('body').hasClass('open_beforeYouLeave')) {
            $('body').removeClass('open_beforeYouLeave');
        }
    }
    if ($(window).width() > 1024) {
        toggleAccount();
    }

    function toggleAccount_mobile() {
        $('.accountMobile').on('click', function(e) {
            $('body').addClass('themevale-open-account');
        });

        $('#account-mobile .themevale_close2').on('click', function(e) {
            $('body').removeClass('themevale-open-account');
        });
        
        $('.themevale_background').on('click', function(e) {
            if ($('body').hasClass('themevale-open-account')) {
                $('body').removeClass('themevale-open-account');
            }
        });
    }
    if ($(window).width() <= 1024) {
        toggleAccount_mobile();
    }

    function toggleCart_mobile() {
        $('#cart-mobile .themevale_close2').on('click', function() {
            if ($('body').hasClass('themevale-open-cart')) {
                $('body').removeClass('themevale-open-cart');
            }
        });
    }
    if ($(window).width() <= 1024) {
        toggleCart_mobile();
    }
    
    function toggleCurrency() {
        $('.navUser-section--currency .navUser-action--currencySelector').on('click', function(ev) {
            $('body').removeClass('themevale-open-cart');
            if ($('body').hasClass('open_beforeYouLeave')) {
                $('body').removeClass('open_beforeYouLeave');
            }
        })
    }
    if ($(window).width() > 1024) {
        toggleCurrency();
    }
        
    // Popular Products in Quick Search Popup
    function searchProductsBlock() {
        var productIDS = context.themeSettings.search_product_block_id;
        var showBrand = context.themeSettings.show_brand_product_gallery;
        var listIDs = JSON.parse("[" + productIDS + "]");

        for (var i = 0; i < listIDs.length; i++) {
             var productId = listIDs[i];
             if ($('.search_product_block .productGrid').length) {
               if ($('.search_product_block .productGrid li').length <=0) {
                    utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
                        var data_product_id = $('.productView-product .productView-title', $(response)).attr('data-product-id');
                        var brand = '';
                        var brandHTML = '';
                        if (showBrand == true) {
                            brand = $('.productView-brand a', $(response)).text();
                            brandHTML = '<p class="card-text card-brand" data-test-info-type="brandName">'+brand+'</p>';
                        }
                        
                        var name = $('.productView-product .productView-title', $(response)).text();
                        var img = $('.productView-image', $(response)).find('img').attr('src');
                        var url = $('.productView-product .productView-title', $(response)).data('url');
                        var price = $('.productView-price', $(response)).html();

                        //Data Option
                        var data_option =  $('[data-product-option-change]',$(response)).find('[data-product-attribute="swatch"]').html();
                        var dataOption = '';
                        if (data_option != undefined) {
                            dataOption = '<div class="card-option card-option-'+ data_product_id+' card_optionImage product-option-'+ data_product_id + '"><div class="form-field"data-product-attribute=\"swatch\"></div></div>';
                        }

                        var html = '<li class="product">\
                                        <article class="card" data-product-id="'+data_product_id+'">\
                                            <figure class="card-figure">\
                                            <a href="'+url+'">\
                                                <div class="card-img-container">\
                                                    <img class="card-image" src="'+img+'" alt="'+name+'" title="'+name+'">\
                                                \</div>\
                                            </a>\
                                            </figure>\
                                            <div class="card-body">\
                                                '+brandHTML+'\
                                                <h4 class="card-title"><a class="clamp" style="-moz-box-orient: vertical; -webkit-line-clamp: 2;" href="'+url+'">'+name+'</a></h4>\
                                                <div class="card-text card-price">'+price+'</div>\
                                                '+dataOption+'\
                                            </div>\
                                        </article>\
                                    </li>';

                        $('#search_product_block .productGrid').append(html);

                        if($('#search_product_block .productGrid').find('.product').length === listIDs.length){
                            var block_id = 'quick_search_product_block';
                            haloAddOptionForProduct(context, block_id);
                        }
                    });
               }
                 
            }
        }
    }

    function searchMobile() {
        if ($('.themevale-header-layout-1').length) {
            if ($('.navUser-item--quichSearch').length) {
                $('.navUser-item--quichSearch').appendTo('.item--searchMobile');
            }
        } else {
            if ($('.themevaleSearch').length) {
                $('.themevaleSearch').appendTo('#searchMobile');
            }
        }
        $('.item--searchMobile .searchMobile').on('click', function() {
            $('.item--searchMobile .navUser-item--quichSearch').toggleClass('is-open');
            $(this).toggleClass('is-open');
            if ($('.themevale-header-layout-2').length) {
                $('body').addClass('themevale-open-search');
                $('.themevale_background').on('click', function(e) {
                    if ($('body').hasClass('themevale-open-search')) {
                        $('body').removeClass('themevale-open-search');
                    }
                });
            }
        });
    }

    if ($(window).width() <= 1024) {
        searchMobile();
    }

    function menuMobile() {
        if ($('#menu .navPages').length) {
            $('#menu .navPages').appendTo('#menuMobile');
        }
    }

    if ($(window).width() <= 1024) {
        // menuMobile();
    }
    
    /* ------------------------ */
    var homeProColumn = context.themeSettings.homepage_product_column_count;

    /* Ajax load product in Home Product Carousel */
    function request($placeholder, tmpl, urlKey) {
        if ($placeholder.data('themevaleLoaded')) return;

        let template = tmpl;
        if ($placeholder.data('themevaleTemplate')) { template = $placeholder.data('themevaleTemplate'); }

        let url = $placeholder.data(urlKey);
        url = url.replace(/https?:\/\/[^/]+/, ''); // WORKAROUND: fix stencil localhost use real absolute urls
        
        utils.api.getPage(url, { template }, (err, resp) => {
            $placeholder.html(resp);
            $placeholder.data('themevaleLoaded', true);
            var newText = $placeholder.parent().find('.newText').text();

            $placeholder.find('.card').each(function() {
                var id = $(this).data('product-id');
                var a = arrNew.indexOf($(this).data('product-id'));
                if( a != -1){                       
                    $(this).find('.card-figure').prepend('<div class="product-badge new-badge"><span class="text">'+newText+'</span></div>')
                } 
            });
            
            var carouselId = $placeholder.find('.productCarousel').attr('id');

            haloAddOptionForProduct(context, carouselId);

            // init products carousel
            if ($(window).width() > 1024) {
                if (!$placeholder.find('.productCarousel').hasClass('slick-slider')) {
                    $placeholder.find('.productCarousel').slick({
                        infinite: false,
                        slidesToShow: homeProColumn,
                        slidesToScroll:homeProColumn,
                        dots: false,
                        arrows: true
                    });
                }
                
            }
        });
    }

    // Ajax load products in a category
    function initAjaxProductsByCategory() {
        var template = 'themevale/homepage/ajax-products-by-category-id-result', 
            urlKey = 'themevaleProductsByCategory';

        $('[data-themevale-products-by-category]').each((i, placeholder) => {
            Pace.ignore(() => {
                request($(placeholder), template, urlKey);
            });

        });
    }
   initAjaxProductsByCategory();

    /* Slick for  Home Products Carousel */
    function homeProductsCarousel() {
        if ($(window).width() > 1024) {
            if (!$('#homeNewProductCarousel1 .productCarousel').hasClass('slick-slider')) {
                $('#homeNewProductCarousel1 .productCarousel').slick({
                    infinite: false,
                    slidesToShow: homeProColumn,
                    slidesToScroll: homeProColumn,
                    dots: false,
                    arrows: true
                });
            }
        }
    }
    
    homeProductsCarousel();
    
    

    // Count Down Hero Carousel
    function countDownHeroCarousel() {
        var countDown = context.themeSettings.hero_carousel_countdown;
        var position = (parseInt(context.themeSettings.hero_carousel_countdown_position) - 1);
        var subTitle = context.themeSettings.hero_carousel_special_subtitle;
        if (position != undefined) {
            if ($('.heroCarousel .slide-item-' + position).length) {
                $('.heroCarousel .slide-item-' + position).each(function(index) {
                    $(this).find('.heroCarousel-content .heroCarousel-description').after('<div class="countDowntimer" data-count-down="'+countDown+'"></div>');
                    $(this).find('.heroCarousel-slide').addClass('hasCountDown');
                    $(this).find('.heroCarousel-content').prepend('<h2 class="heroCarousel-subTitle"><span class="text">'+subTitle+'</span></h2>');
                });
            }
        }
    }
    countDownHeroCarousel();

   /* Count Down */
   function initCountdown() {
        if ($('.countDowntimer').length) {   
            var countDownDate = new Date( $('.countDowntimer').attr('data-count-down')).getTime();
            var countdownfunction = setInterval(function() {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    $(".countDowntimer").html('');
                } else {
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    var strCountDown = "<div class='clock-item'><span class='num'>"+ days + "</span><span class='text'>days</span></div><div class='clock-item'><span class='num'>"+ hours + "</span><span class='text'>hours</span></div><div class='clock-item'><span class='num'>" + minutes + "</span><span class='text'>mins</span></div><div class='clock-item'><span class='num'>" + seconds + "</span><span class='text'>secs</span></div>";
                    $(".countDowntimer").html(strCountDown);
                }
            }, 1000);
        }
   }
   initCountdown();

   function initCountdown2() {
        if ($('.countDowntimer2').length) {  
            var countDownDate = new Date( $('.countDowntimer2').attr('data-count-down2')).getTime();
            var countdownfunction = setInterval(function() {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    $(".countDowntimer2").html('');
                } else {
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    var strCountDown = "<div class='clock-item'><span class='num'>"+ days + "D</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>"+ hours + "H</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + minutes + "M</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + seconds + "S</span></div>";
                    $(".countDowntimer2").html(strCountDown);
                }
            }, 1000);
        }
   }
   initCountdown2();

   /* Image Parallax */
    function backgroundParallax() {
        $('.hero-image-parallax').each(function() {
            var img = $(this).data('image-parallax');
            var linkStore = $(this).data('store');
            var imgLink = linkStore + img;
            if (img != undefined) {
                $(this).css('background-image', 'url(' + imgLink + ')');
            }
            
        });
    }
    backgroundParallax();

    function instagramShowMore() {
        var imageToShow = 7;

        if ($(window).width() <= 767) {
            imageToShow = 4;
        } else if ($(window).width() <= 1024) {
            imageToShow = 6;
        } else {
            imageToShow = 7;
        }
        
        if ($('.infinite-scrolling-instagram .intagram-btn').length) {
            $('.infinite-scrolling-instagram .intagram-btn').on('click', function(e) {
                e.preventDefault();
                var listImages = $(this).parents('#InstagramGallery');
                listImages.find('.instagram-link:hidden:lt(' + imageToShow + ')').show();
                if (listImages.find('.instagram-link:hidden').length === 0) {
                    $(this).addClass('no-more');
                }
            });
        }

        if ($('.themevale_instagram_layout_1 #instafeed').length) {
            if ($('#instafeed .instagram-link').length > imageToShow) {
                $('#instafeed .instagram-link').css({ 'display': 'inline-block' });
                for(var i = imageToShow + 1; i <= $('#instafeed .instagram-link').length; i++) {
                    $('#instafeed .instagram-link:nth-child('+i+')').css({ 'display': 'none' });
                }
            }
        }
    }
    if($('.page-type-default').length) {
        instagramShowMore();
    }

    // Add WishList
    function addWishList() {
        $('.card .wishlist').on('click', function(e){
             e.preventDefault();
            var $this_wl = $(this);
            var url_awl = $this_wl.attr('href');

            $.post(url_awl).done(function() {
                window.location.href = url_awl;
            });
        });
    }
    addWishList(); 
   
    function footer_newsletter() {
        if (!$('[data-popup-newsletter]').length)
            return;

        $(document).on('click', '[data-popup-newsletter]', function() {
            setTimeout(function() {
                $('#themevale_newsletter').removeClass('hide fadeOut').addClass('animated fadeIn');
                $('body').addClass('has-newsletter');
            }, 500);
        });
        $(document).on('click', '[data-close-newsletter-popup]', function() {
            $('#themevale_newsletter').removeClass('fadeIn').addClass('fadeOut');
            setTimeout(function() {
                $('#themevale_newsletter').addClass('hide');
                $('body').removeClass('has-newsletter');
            }, 300);
          });
          
        $('.popup-overlay').on('click', function(ev) {
            $('#themevale_newsletter').removeClass('fadeIn').addClass('fadeOut');
            setTimeout(function() {
                $('#themevale_newsletter').addClass('hide');
                $('body').removeClass('has-newsletter');
            }, 300);
        });
    }
    footer_newsletter();

    // ========================================================================
    // Footer on Mobile & tablet
    // ========================================================================
    function footer_mobile() {
        if ($(window).width() <= 767) {
            if(!$('.footer-info').hasClass('footerMobile')) {
                $('.footer-info').addClass('footerMobile');
                $('.footer-dropdownmobile .footer-info-list').css('display', 'none');
            }
        } else {
            $('.footer-info').removeClass('footerMobile');
            $('.footer-dropdownmobile').removeClass('open-dropdown');
            $('.footer-dropdownmobile .footer-info-list').css('display', 'block');
        }
    }
    footer_mobile();

    function toggle_footer() {
        $('.footerMobile .footer-dropdownmobile .footer-info-heading').on('click', function(ev) {
            $(this).parent().toggleClass('open-dropdown');
            $(this).parent().find('.footer-info-list').slideToggle();
        });
    }
    toggle_footer();

    function sidebarProductsCarousel() {
        if ($('.page-sidebar .productCarousel .productCarousel-slide').length > 0) {
            $('.page-sidebar .productCarousel').slick({
                dots: true,
                arrows: true,
                slidesPerRow: 1,
                rows: 1,
                mobileFirst: true,
                infinite: false,
                adaptiveHeight: false,
                responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesPerRow: 1,
                    rows: 3
                  }
                },
                {
                  breakpoint: 767,
                  settings: {
                    slidesPerRow: 1,
                    rows: 2
                  }
                }
              ]
            });
        }
    }

    function initSidebar() {
        if ($('.sidebar-label').is(":visible") == true) {
            $('.sidebar-label').on('click', function(ev) {
                $('body').addClass('themevale_open_sidebar');
                sidebarProductsCarousel();
            });
        } else {
            sidebarProductsCarousel();
        }
        if ($('.close-sidebar .icon-close').length) {
            $('.close-sidebar .icon-close').on('click', function(ev) {
                $('body').removeClass('themevale_open_sidebar');
            });
        }

        $('.themevale_background').on('click', function() {
            if ($('body').hasClass('themevale_open_sidebar')) {
                $('body').removeClass('themevale_open_sidebar');
            }
         });

        if ($('.page-type-blog').length) {
            sidebarProductsCarousel();
        }
    }  
    initSidebar();

    function checkCookiesPopup() {
        if ($('#consent-manager').length) {
            var height = $('#consent-manager').height();
            $('body').css('padding-bottom',height);
        }
        if ($('#consent-manager-update-banner').length) {
            var height = $('#consent-manager-update-banner').height();
            $('body').css('padding-bottom',height);
        }
    }
    checkCookiesPopup();

    /* Active Tag on Blog page */
    function activeTag() {
        if ($('#blog-tags .tags').length > 0) {
            $('#blog-tags .tags li').each(function() {
                var currentLink = window.location.pathname;
                var TagLink = $(this).find('a').attr('href');
                if (currentLink == TagLink) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            });
        }
    }
    activeTag();

    /* Image Carousel on Blog Detail page */
    function gallery_carousel() {
        $('.imageGallery-carousel').slick({
            dots: true,
            arrows: false,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    arrows: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 551,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            }]
        });
    }
    if ($('.blog-post').length) {
        gallery_carousel();
    }

    // Someone Purchase
    function recentlyBought() {
        var productIDs = context.themeSettings.recently_bought_productID;
        var Location1 = context.themeSettings.recently_bought_location1;
        var Location2 = context.themeSettings.recently_bought_location2;
        var Location3 = context.themeSettings.recently_bought_location3;
        var Location4 = context.themeSettings.recently_bought_location4;
        var Location5 = context.themeSettings.recently_bought_location5;
        var Location6 = context.themeSettings.recently_bought_location6;
        var Location7 = context.themeSettings.recently_bought_location7;
        var Location8 = context.themeSettings.recently_bought_location8;
        var Location9 = context.themeSettings.recently_bought_location9;
        var Location10 = context.themeSettings.recently_bought_location10;
        var ar1 = Location1.split(',');
        var ar2 = Location2.split(',');
        var ar3 = Location3.split(',');
        var ar4 = Location4.split(',');
        var ar5 = Location5.split(',');
        var ar6 = Location6.split(',');
        var ar7 = Location7.split(',');
        var ar8 = Location8.split(',');
        var ar9 = Location9.split(',');
        var ar10 = Location10.split(',');

        var hoursItems = context.themeSettings.recently_bought_hours;
        var listHours = JSON.parse("[" + hoursItems + "]");

        var listIDs = JSON.parse("[" + productIDs + "]");

        var text_info = context.themeSettings.recently_bought_text_info;
        var text_name = context.themeSettings.recently_bought_text_name;

        var changeSlides = context.themeSettings.recently_bought_changeSlides;
        var changeSlidesTime = 1000 * (Number(changeSlides));

        $(".themevale_popup").prepend('<div id="recently_bought_list"></div>');

        var recently = setInterval(function(){
            $('.themevale_recently-bought').hide();
            var item = (Math.floor(Math.random()*listIDs.length));
            var productId = listIDs[item];

            var locationList = Array(ar1,ar2,ar3,ar4,ar5,ar6,ar7,ar8,ar9,ar10);
            var locationItem = (Math.floor(Math.random()*locationList.length));
            var location = locationList[locationItem];

            var hour_item = (Math.floor(Math.random()*listHours.length));
            var hours = listHours[hour_item];

            if ($.cookie('recently_bought_notification') == 'closed') {
                $('#recently_bought_list').remove();
                clearInterval(recently);
            }
            $(document).on('click','.themevale_recently-bought .modal-close',function(){
                $('#recently_bought_list').remove();
                clearInterval(recently);
                $.cookie('recently_bought_notification', 'closed', {expires:1, path:'/'});
            });
            if( $('#RB_'+ productId).length ) {             
                $('#RB_'+ productId).show();
                $('.themevale_recently-bought').css('animation-name','fadeInUp');
            }
            else {
                utils.api.product.getById(productId, { template: 'products/product-view' }, (err, response) => {
                    var name = $('.productView-product .productView-title', $(response)).text();
                    var img = $('.productView-image', $(response)).find('img').attr('src');
                    var url = $('.productView-title', $(response)).data('url');

                    var html = '<div id="RB_'+productId+'" class="themevale_recently-bought">\
                        <a href="#" class="modal-close" data-close-recently-bought>&times;</a>\
                        <div class="recently-bought-inner">\
                            <div class="product-image">\
                                <a href="'+url+'"><img class="image" src="'+img+'" alt="'+name+'" title="'+name+'"></a>\
                            </div>\
                            <div class="product-info">\
                                <p class="text-wrap"><span class="text">'+text_name+'</span><span class="product-name"><a href="'+url+'">'+name+'</a></span></p>\
                                <div id="location-info">'+hours+' '+text_info+' '+location+'</div>\
                            </div>\
                        </div>\
                    </div>';
                    $('#recently_bought_list').append(html);

                    $('.themevale_recently-bought').css('animation-name','fadeInUp');

                });
            }
            setTimeout(function(){ 
                 $('#RB_'+ productId).hide();
                 
            }, 8000);
        }, changeSlidesTime); 
    }
    if ($(window).width() > 767) {
        if (context.themeSettings.recently_bought == true) {
            recentlyBought();
        } 
    } else {
        if(context.themeSettings.recently_bought == true && context.themeSettings.show_recently_bought_mobile == true) {
            recentlyBought();
        }
    }

    if ( $("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox({
            'animationEffect': 'fade',
            'transitionEffect': 'fade',
            'loop' : 'true'
        });
    }

    // Lookbook
    function lookbook() {
        var newProduct= context.themeSettings.homepage_new_products_count;
        const $options = {
            config: {
                products: {
                    new: {
                        limit: newProduct,
                    },
                },
            },
            template: 'themevale/product/lookbook-products'
        };
        const $thisProd = $('.lookbook-popup');
        $('.lookbook-item .position-point').on('click', function() {
            
            $thisProd.empty();
            var $prodId = $(this).data('product-id');
            var position = $(this).offset();
            var container = $('.page > .container').offset();
            var innerContainer = $('.page > .container').innerWidth();           
            var iconWidth = $(this).innerWidth();
            var innerLookbookModal = $('.lookbook-popup').innerWidth();
            var str3 = iconWidth + "px";
            var str4 = innerLookbookModal + "px";
            utils.api.product.getById($prodId, $options, (err, response) => {
                if (err) {
                    return false;
                }
                $thisProd.html(response);
                $thisProd.find('[data-product-id]').attr('data-product-id',$prodId);
                var productLink = $('.card-title > a', response).attr('href');

                var size = $('[data-product-option-change3] .size', $(response)).html();
                var colorVariantToShow = 3;
                var count_option = $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).length;
                var more_option = (count_option - colorVariantToShow);
                var data_option = $('[data-product-attribute="swatch"]', response).html();

                if(count_option > colorVariantToShow){
                    $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).each(function(i){
                        if(i>=colorVariantToShow){
                            var option_id = $(this).attr('data-product-attribute-value');
                            data_option = data_option.replace('data-product-attribute-value=\"'+option_id+'\"', 'data-product-attribute-value="'+option_id+'" data-show style="display:none;" ');
                        }
                    });
                    data_option = data_option + '<span class="showmore"><a href="'+productLink+'" title="More Color">+'+more_option+'</a></span>';
                }
                if (data_option != undefined){
                    $thisProd.find('.card-body').append('<div class="card_optionImage product-option-' + $prodId + '"><div data-product-option-change3><div data-product-attribute=\'swatch\'>' + data_option + '</div></div></div>');
                }
                
                if (size != undefined) {
                    $thisProd.find('.card-figure').append('<div class="card_optionSize">'+size+'</div>');
                }
                
                var colorName = $('[data-product-attribute="swatch"] .form-option > span', response).attr('title');
                if (colorName != undefined) {
                    $thisProd.find('.card-title').append('<div class="color-name">'+colorName+'</div>');
                }
                
                $thisProd.find('form').remove();
            });

            $thisProd.toggleClass("show");
            if ($(window).width() > 551) {
                if (position.left > (innerLookbookModal + 30)) {
                    var newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                    if (position.left > (container.left + innerContainer - innerLookbookModal)) {
                        newleft = "calc(" + position.left + "px" + " - " + str4 + " + " + "4px" + ")";
                    }          
                } else {
                    newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                }
                $thisProd.css({'top': position.top - container.top - 145, 'left': newleft});
                
            } else if (($(window).width() > 320) && $(window).width() < 551) {
                $thisProd.css({'top': position.top - container.top + 50, 'left': 50});
            } else {
                $thisProd.css({'top': position.top - container.top + 50, 'left': 25});
            }
        });

        $(document).on('click', event => {
            if ($thisProd.hasClass("show")) {
                if (($(event.target).closest($thisProd).length === 0) && ($(event.target).closest('.position-point').length === 0)) {
                    $thisProd.removeClass("show");
                }
            }
        });
    }
    if($('.themevale_lookbook').length) {
        lookbook();
    }

    /* Lookbook Banner on Homepage */
    function lookbookHomepageBanner() {
        var newProduct= context.themeSettings.homepage_new_products_count;
        const $options = {
            config: {
                products: {
                    new: {
                        limit: newProduct,
                    },
                },
            },
            template: 'themevale/product/lookbook-products'
        };
        const $thisProd = $('.lookbook-popup');
        $('.lookbook-item .position-point').on('click', function() {
            $thisProd.empty();
            var $prodId = $(this).data('product-id');
            var position = $(this).offset();
            var container = $('.themevale_homepage_banner_lookbook').offset();
            var innerContainer = $('.themevale_homepage_banner_lookbook').innerWidth();           
            var iconWidth = $(this).innerWidth();
            var innerLookbookModal = $('.lookbook-popup').innerWidth();
            var str3 = iconWidth + "px";
            var str4 = innerLookbookModal + "px";
            
            utils.api.product.getById($prodId, $options, (err, response) => {
                if (err) {
                    return false;
                }
                $thisProd.html(response);
                $thisProd.find('[data-product-id]').attr('data-product-id',$prodId);
                var productLink = $('.card-title > a', response).attr('href');

                var size = $('[data-product-option-change3] .size', $(response)).html();
                var colorVariantToShow = 3;
                var count_option = $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).length;
                var more_option = (count_option - colorVariantToShow);
                var data_option = $('[data-product-attribute="swatch"]', response).html();

                if(count_option > colorVariantToShow){
                    $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).each(function(i){
                        if(i>=colorVariantToShow){
                            var option_id = $(this).attr('data-product-attribute-value');
                            data_option = data_option.replace('data-product-attribute-value=\"'+option_id+'\"', 'data-product-attribute-value="'+option_id+'" data-show style="display:none;" ');
                        }
                    });
                    data_option = data_option + '<span class="showmore"><a href="'+productLink+'" title="More Color">+'+more_option+'</a></span>';
                }
                if (data_option != undefined){
                    $thisProd.find('.card-body').append('<div class="card_optionImage product-option-' + $prodId + '"><div data-product-option-change3><div data-product-attribute=\'swatch\'>' + data_option + '</div></div></div>');
                }
                
                if (size != undefined) {
                    $thisProd.find('.card-figure').append('<div class="card_optionSize">'+size+'</div>');
                }
                
                var colorName = $('[data-product-attribute="swatch"] .form-option > span', response).attr('title');
                if (colorName != undefined) {
                    $thisProd.find('.card-title').append('<div class="color-name">'+colorName+'</div>');
                }
                
                $thisProd.find('form').remove();
            });

            $thisProd.toggleClass("show");
            if ($(window).width() > 551) {
                if (position.left > (innerLookbookModal + 30)) {
                    var newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                    if (position.left > (container.left + innerContainer - innerLookbookModal)) {
                        newleft = "calc(" + position.left + "px" + " - " + str4 + " + " + "4px" + ")";
                     }
                } else {
                    newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                }
                $thisProd.css({'top': position.top - container.top - 145, 'left': newleft});
                
            } else if (($(window).width() > 320) && $(window).width() < 551) {
                $thisProd.css({'top': position.top - container.top + 30, 'left': 50});
            } else {
                $thisProd.css({'top': position.top - container.top + 30, 'left': 25});
            }
        });

        $(document).on('click', event => {
            if ($thisProd.hasClass("show")) {
                if (($(event.target).closest($thisProd).length === 0) && ($(event.target).closest('.position-point').length === 0)) {
                    $thisProd.removeClass("show");
                }
            }
        });
    }
    if($('.themevale_homepage_banner_lookbook').length) {
        lookbookHomepageBanner();
    }

    /* Lookbook on Blog Detail Page*/
    function lookbookBlog() {
        var newProduct= context.themeSettings.homepage_new_products_count;
        const $options = {
            config: {
                products: {
                    new: {
                        limit: newProduct,
                    },
                },
            },
            template: 'themevale/product/lookbook-products'
        };
        const $thisProd = $('.lookbook-popup');
        $('.lookbook-item .position-point').on('click', function() {
            $thisProd.empty();
            var $prodId = $(this).data('product-id');
            var position = $(this).offset();
            var container = $('.page.blog-post').offset();
            var innerContainer = $('.page.blog-post .blog-post-body').innerWidth();
            var iconWidth = $(this).innerWidth();
            var innerLookbookModal = $('.lookbook-popup').innerWidth();
            var str3 = iconWidth + "px";
            var str4 = innerLookbookModal + "px";
            
            utils.api.product.getById($prodId, $options, (err, response) => {
                if (err) {
                    return false;
                }
                $thisProd.html(response);
                $thisProd.find('[data-product-id]').attr('data-product-id',$prodId);
                var productLink = $('.card-title > a', response).attr('href');

                var size = $('[data-product-option-change3] .size', $(response)).html();
                var colorVariantToShow = 3;
                var count_option = $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).length;
                var more_option = (count_option - colorVariantToShow);
                var data_option = $('[data-product-attribute="swatch"]', response).html();

                if(count_option > colorVariantToShow){
                    $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).each(function(i){
                        if(i>=colorVariantToShow){
                            var option_id = $(this).attr('data-product-attribute-value');
                            data_option = data_option.replace('data-product-attribute-value=\"'+option_id+'\"', 'data-product-attribute-value="'+option_id+'" data-show style="display:none;" ');
                        }
                    });
                    data_option = data_option + '<span class="showmore"><a href="'+productLink+'" title="More Color">+'+more_option+'</a></span>';
                }
                if (data_option != undefined){
                    $thisProd.find('.card-body').append('<div class="card_optionImage product-option-' + $prodId + '"><div data-product-option-change3><div data-product-attribute=\'swatch\'>' + data_option + '</div></div></div>');
                }
                
                if (size != undefined) {
                    $thisProd.find('.card-figure').append('<div class="card_optionSize">'+size+'</div>');
                }
                
                var colorName = $('[data-product-attribute="swatch"] .form-option > span', response).attr('title');
                if (colorName != undefined) {
                    $thisProd.find('.card-title').append('<div class="color-name">'+colorName+'</div>');
                }
                
                $thisProd.find('form').remove();
            });

            $thisProd.toggleClass("show");

            if ($(window).width() > 551) {
                if (position.left > (innerLookbookModal + 30)) {
                    var newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                    if (position.left > (container.left + innerContainer - innerLookbookModal)) {
                        newleft = "calc(" + position.left + "px" + " - " + str4 + " + " + "4px" + ")";
                    }               
                } else {
                    newleft = "calc(" + position.left + "px" + " + " + str3 + " - " + "4px" + ")";
                }
                $thisProd.css({'top': position.top - container.top - 155, 'left': newleft});
                
            } else if (($(window).width() > 320) && $(window).width() < 551) {
                $thisProd.css({'top': position.top - container.top + 30, 'left': 50});

            } else {
                $thisProd.css({'top': position.top - container.top + 30, 'left': 25});
            }
        });

        $(document).on('click', event => {
            if ($thisProd.hasClass("show")) {
                if (($(event.target).closest($thisProd).length === 0) && ($(event.target).closest('.position-point').length === 0)) {
                    $thisProd.removeClass("show");
                }
            }
        });
    }

    if($('.page-type-blog_post').length) {
        lookbookBlog();
    }

    // Change position of Product Tab on Tablet and Mobile
    function changePositionProductTab() {
        if($('.product-layout-1').length) {
            if ($(window).width() <= 1024) {
                $('.productView-images .productView-description').appendTo('.productView');
                $('.productView-details-wrap .productView-details-3').appendTo('.productView');
            } else {
                $('.productView > .productView-description').appendTo('.productView-images');
                $('.productView .productView-details-3').appendTo('.productView-details-wrap');
            }
        } else {
            if ($(window).width() <= 1024) {
                $('.productView-details-wrap .productView-details-3').appendTo('.productView');
            } else {
                $('.productView .productView-details-3').appendTo('.productView-details-wrap');
            }
        }
    }

    var flag = true;
    // Show More - Show Less on Description Tab
    function showMoreDescription() {
        if($(window).width() <= 767) {
            if (flag) {
                flag = false;
                var maxHeight = 320;
                var heightDescription = $('.productView-description #tab-description-content').height();
                if (maxHeight < heightDescription) {
                    $('.productView-description #tab-description-content').css('max-height',maxHeight);
                    $('.productView-description #tab-description-content .description_showmore').removeClass('hide');

                    $('.description_showmore .show_more .button').on('click', function(e){
                        $('.productView-description #tab-description-content').css('max-height','100%');
                        $(this).removeClass('show').addClass('hide');
                        $('.description_showmore .show_less').removeClass('hide').addClass('show');
                    });

                    $('.description_showmore .show_less .button').on('click', function(e){
                        $('.productView-description #tab-description-content').css('max-height',maxHeight);
                        $(this).removeClass('show').addClass('hide');
                        $('.description_showmore .show_more').removeClass('hide').addClass('show');
                    });
                }
            }           
        } else {
            flag = true;
            $('.productView-description #tab-description-content').css('max-height','100%');
        }
    }

    if($('.page-type-product').length) {
        changePositionProductTab();
        showMoreDescription();
    }

    $(window).resize(function() {
        footer_mobile();
        lookbook();
        changePositionProductTab();
        showMoreDescription();
        if($('.page-type-default').length) {
            instagramShowMore();
        }
    });
}