import utils from '@bigcommerce/stencil-utils';
import 'slick-carousel';

export default class themevaleMenu
{
    constructor() {
    }

    menuItem(num) {
 
        return {
            themevaleMegaMenu(param) {
                // Defaut params
                param = $.extend({
                dropAlign: 'fullWidth',
                dropWidth: '100%',
                dropType: 'imageRight',
                cateColumns: 1,
                bottomMegamenu: 'none',
                disabled: false,
                bottomCates: '',
                imagesTop: '',
                brandCol: false,
                showColLeft: false,
                colLeft: '',
                productId: '',
                label: '',
                }, param);

                $('.navPages > ul.navPages-list:not(.navPages-list--user) > li:nth-child(' + num + ')').each(function(idx, el) {
                    if (param.disabled === false) {
                        const subMegaMenu = $(el).children('.navPage-subMenu');
                        const navPages_action = $(el).find('>.navPages-action >.text');

                        $(el).addClass('hasMegamenu');
                        subMegaMenu.removeClass('subMenu').addClass('navPage-subMegaMenu');

                        // label: New, Sale, Hot
                        if (param.label === 'new') {
                            navPages_action.after('<span class="navPages-label new-label">Neu</span>');
                        } else if (param.label === 'sale') {
                            navPages_action.after('<span class="navPages-label sale-label">Sale</span>');
                         } else if (param.label === 'hot') {
                            navPages_action.after('<span class="navPages-label hot-label">Hot</span>');
                        }

                        // dropdown Alignment
                        if (param.dropAlign === 'fullWidth') {
                            $(el).addClass('fullWidth');
                        } else if (param.dropAlign === 'center') {
                            $(el).addClass('alignCenter');
                        } else if (param.dropAlign === 'right') {
                            $(el).addClass('alignRight');
                        } else if (param.dropAlign == 'left-edge') {
                            $(el).addClass('alignLeftEdge');
                        }  else {
                            $(el).addClass('alignLeft');
                        }

                        // dropdown Type
                        if (param.dropType === 'imageLeft') {
                            subMegaMenu.addClass('imageLeft');
                            subMegaMenu.wrapInner('<div class="cateArea colRight"></div>');
                            subMegaMenu.append('<div class="imageArea colLeft">' + param.images + '</div>');
                        } else if (param.dropType === 'imageRight') {
                            if (subMegaMenu.find('.imageArea.colRight').length <= 0) {
                                subMegaMenu.addClass('imageRight');
                                subMegaMenu.wrapInner('<div class="cateArea colLeft"></div>');
                                subMegaMenu.append('<div class="imageArea colRight">' + param.images + '</div>');
                            }

                        } else if (param.dropType === 'noImage') {
                            subMegaMenu.addClass('noImage').wrapInner('<div class="cateArea"></div>');
                            subMegaMenu.find('.cateArea').css({
                                'max-width': '100%'
                            });
                        } else if (param.dropType === 'imageTop') {
                            subMegaMenu.addClass('imageTop').wrapInner('<div class="cateArea"></div>');
                        }


                        // dropdown Width
                        if ((param.dropAlign === 'fullWidth')) {
                            subMegaMenu.wrapInner('<div class="container"></div>');
                            subMegaMenu.css({
                                'width': '100%'
                            });
                        } else {
                            subMegaMenu.wrapInner('<div class="navPage-subMenu-inner"></div>');
                            subMegaMenu.css({
                                'width': param.dropWidth
                            });
                        }

                        // cateColumns
                        if (param.cateColumns === 2) {
                            subMegaMenu.find('.cateArea').addClass('columns-2');
                        } else if (param.cateColumns === 3) {
                            subMegaMenu.find('.cateArea').addClass('columns-3');
                        } else if (param.cateColumns === 4) {
                            subMegaMenu.find('.cateArea').addClass('columns-4');
                        } else if (param.cateColumns === 5) {
                            subMegaMenu.find('.cateArea').addClass('columns-5');
                        } else if (param.cateColumns === 6) {
                            subMegaMenu.find('.cateArea').addClass('columns-6');
                        }

                        // imageAreaWidth
                        subMegaMenu.find('.imageArea').css({
                            'width': '100%',
                            'max-width': param.imageAreaWidth
                        });

                        // cateAreaWidth
                        if (subMegaMenu.hasClass('noImage')) {
                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': '100%'
                            });
                        } else {
                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });
                        }

                        // bottomCates
                        if (param.bottomCates.length && (param.bottomCates !== '')) {
                            subMegaMenu.find('.cateArea').addClass('has-bottom-cates');
                            subMegaMenu.find('.cateArea > ul').append('<div class="bottomCate" style="max-width: ' + param.cateAreaWidth + '">' + param.bottomCates + '</div>');
                        }

                        // imagesTop
                        if (param.imagesTop.length && (param.imagesTop !== '')) {
                            function megamenuImageTop($_image_array) {
                                var j = 1;
                                for (var i = 0; i < $_image_array.length; i++) {
                                    j = j + 1;
                                    subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') > .navPages-action').after($_image_array[i]);
                                }
                            }
                            megamenuImageTop(param.imagesTop);
                        }

                        // bottomMegamenu
                        if (param.bottomMegamenu.length && (param.bottomMegamenu !== 'none')) {
                            subMegaMenu.append('<div class="bottomMegamenu">' + param.bottomMegamenu + '</div>');
                        }

                        // Products Block
                        if (param.productId.length && (param.productId !== '')) {
                            var featuredProductCarousel = subMegaMenu.find('.featuredProductCarousel');
                            var featuredProduct = subMegaMenu.find('.featuredProductCarousel li');

                            function carouselMegaMenu() {
                                var itemShow = 2;
                                if (param.dropAlign === 'fullWidth') {
                                    itemShow = 2;
                                } else {
                                    itemShow = 1;
                                }
                                featuredProductCarousel.slick({
                                    infinite: true,
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    dots: false,
                                    arrows: true,
                                    mobileFirst: true,
                                    responsive: [
                                        {
                                            breakpoint: 1440,
                                            settings: {
                                                slidesToShow: itemShow,
                                                slidesToScroll: itemShow
                                            }
                                        }
                                    ]
                                });
                                $(".navPages-list > li").mouseover(function() {
                                    if ($(this).find('.featuredProductCarousel.slick-slider').length) {
                                        featuredProductCarousel.get(0).slick.setPosition();
                                    }
                                });
                            }

                            function productId($_productId) {
                                var productIDS = param.productId;

                                if (param.productId !== '') {
                                    var listIDs = JSON.parse("[" + productIDS + "]");
                                    for (var i = 0; i < listIDs.length; i++) {
                                        var productId = listIDs[i];
                                        if (featuredProductCarousel.length) {
                                            utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
                                                var name = $('.productView-product .productView-title', $(response)).text();
                                                var img = $('.productView-image', $(response)).find('img').attr('src');
                                                var url = $('.productView-product .productView-title', $(response)).data('url');
                                                var price = $('.productView-price', $(response)).html();              
                                                var html = '<div class="product">\
                                                                <article class="card">\
                                                                    <figure class="card-figure">\
                                                                    <div class="card-img-container">\
                                                                        <a href="'+url+'"><img class="card-image" src="'+img+'" alt="'+name+'" title="'+name+'"></a>\
                                                                    </div>\
                                                                    </figure>\
                                                                    <div class="card-body">\
                                                                        <h4 class="card-title"><a class="clamp" style="-webkit-box-orient: vertical;-webkit-line-clamp: 2;" href="'+url+'">'+name+'</a></h4>\
                                                                        <div class="card-text card-price">'+price+'</div>\
                                                                        <a href="'+url+'" class="card-button">Details</a>\
                                                                    </div>\
                                                                </article>\
                                                            </div>';

                                                if(featuredProductCarousel.hasClass('slick-initialized')) {
                                                    featuredProductCarousel.slick('unslick');
                                                    featuredProductCarousel.append(html);
                                                } else {
                                                    featuredProductCarousel.append(html);
                                                }
                                                carouselMegaMenu();
                                            });
                                        }
                                    }
                                    subMegaMenu.find(".imgLeft").addClass('show');
                                } 
                            }
                            productId(param.productId);
                        }

                        // colLeft
                        if (param.showColLeft === true) {
                            if (subMegaMenu.find('.cateArea .colLeftArea').length <=0) {
                                subMegaMenu.addClass('hasColLeft');
                                subMegaMenu.find('.cateArea').prepend('<div class="colLeftArea">' + param.colLeft + '</div>');
                            }
                            
                        }

                        // Brand
                        if (param.brandCol === true) {
                            if(subMegaMenu.find('.cateArea .navPage-subMenu-list > .navPage-subMenu-item-brand >.navPage-subMenu > ul > li').length <= 0) {
                                subMegaMenu.addClass('hasBrand');
                                if ($('.navPages-list').hasClass('navPages-list-simple')) {
                                    subMegaMenu.find('.cateArea > .container > .navPage-subMenu-list').append('<li class="navPage-subMenu-item-child navPage-subMenu-item-brand"></li>');
                                } else {
                                    subMegaMenu.find('.cateArea > .navPage-subMenu-list').append('<li class="navPage-subMenu-item-child navPage-subMenu-item-brand"></li>');
                                }
                                
                                subMegaMenu.find('.cateArea .navPage-subMenu-list .navPage-subMenu-item-brand').append('<div class="navPage-subMenu navPage-subMenu-horizontal" id="navPages-brand" aria-hidden="true" tabindex="-1"><ul class="navPage-subMenu-list"></ul></div>');

                                var brand = subMegaMenu.find('.cateArea .navPage-subMenu-list > .navPage-subMenu-item-brand >.navPage-subMenu > ul');
                                getBrand();
                            }
                            
                            function getBrand() {
                                $.ajax({
                                    url: "/brands"
                                  }).done(function (data) {
                                    var html = $(data);
                                    var cell = '';
                                    var items = $('.dataBrands li .card-title', html);
                                    items.each(function (i) {
                                        if (i < 6) {
                                            if($(this).html().length  > 0)
                                            {
                                              cell += '<li class="navPage-subMenu-item-child navPages-action-end">';
                                              cell += $(this).html();
                                              cell += '</li>';
                                            }
                                        }                                       
                                    });

                                    brand.html(cell);
                                    brand.find('a').addClass('navPage-subMenu-action navPages-action');

                                    brand.prepend('<li class="navPage-subMenu-item-child navPage-subMenu-title"><p class="navPage-subMenu-action navPages-action"><span class="navPages-action-moreIcon" aria-hidden="true">&#10095;</span><a class="text" href="/brands">Top Brands</a></p></li>');
                                    
                                    if (items.length > 6) {
                                        brand.append('<li class="view-all navPage-subMenu-item-child navPages-action-end"><a href="/brands" class="navPages-action navPages-action-end"><span>View All</span></a></li>');
                                    }
                                    if (subMegaMenu.find('.navPage-subMenu-item-brand >.navPage-subMenu-action').length <=0) {
                                        subMegaMenu.find('.cateArea .navPage-subMenu-list .navPage-subMenu-item-brand').prepend('<p class="navPage-subMenu-action navPages-action navPages-action-depth-max has-subMenu"><a class="text" href="/brands">Top Brands</a><span class="icon navPages-action-moreIcon" aria-hidden="true">&#10095;</span></p>');
                                    }
                                    
                                    if(brand.find(".card-figure").length) {
                                        brand.find(".card-figure").remove();
                                    }
                                    
                                  });
                            }                           

                            setTimeout(function(){ 
                                $('#menu-mobile .navPage-subMenu-item-brand > .navPage-subMenu-action').on('click', function(){
                                    $(this).parent().addClass('is-open');
                                    $(this).parent().siblings().addClass('is-hidden');
                                  });

                                $('#menu-mobile .navPage-subMenu-item-brand .navPage-subMenu-list .navPage-subMenu-action').on('click', function(){
                                    $(this).parents('.navPage-subMenu-item-brand').removeClass('is-open');
                                    $(this).parents('.navPage-subMenu-item-brand').siblings().removeClass('is-hidden');
                                  });
                            }, 2000);
                        }
                    } else {
                        const navPages_action = $(el).find('>.navPages-action >.text');
                        // label: New, Sale, Hot
                        if (param.label === 'new') {
                            navPages_action.after('<span class="navPages-label new-label">Neu</span>');
                        } else if (param.label === 'sale') {
                            navPages_action.after('<span class="navPages-label sale-label">Sale</span>');
                        } else if (param.label === 'hot') {
                            navPages_action.after('<span class="navPages-label hot-label">Hot</span>');
                        }
                    }
                });
                return this;
            }
        }
}
}
