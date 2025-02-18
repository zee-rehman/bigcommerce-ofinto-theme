import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import productDisplayMode from './themevale/productDisplayMode';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';
import themevaleStickyCategoryFilter from './themevale/themevale_stickyCategoryFilter';

export default class Brand extends CatalogPage {
    constructor(context) {
        super(context);
    }
    onReady() {
        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        //Themevale Function
        productDisplayMode();
        this.category_sidebar();
        themevaleStickyCategoryFilter();
        this.loadOptionForProductCard(this.context);

        if (this.context.themeSettings.themevale_pagination == true) {
            this.showItem();
        }    
        if (this.context.themeSettings.themevale_pagination == false) {
            this.showmore_product();
        }
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.brandProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');
            if($('#product-listing-container .product').length > 0){
                themevale_AddOption(this.context, 'product-listing-container');
            }

            $('html, body').animate({
                scrollTop: 0,
            }, 100);

            if (this.context.themeSettings.themevale_pagination == true) {
                this.showItem();
            }    
            if (this.context.themeSettings.themevale_pagination == false) {
                this.showmore_product();
            }
        });
    }
    loadOptionForProductCard(context){
        if($('#featured-products .card').length > 0){
            themevale_AddOption(context, 'featured-products');
        }

        if($('#product-listing-container .product').length > 0){
            themevale_AddOption(context, 'product-listing-container');
        }
    }

    category_sidebar() {
        if ($('.all-categories-list').length > 0) {
            $('ul.all-categories-list li').each(function() {
              const breadLink = $('.page-type-product #breadcrumbs-wrapper ul li.breadcrumb.is-active').prev('.breadcrumb').children('a').attr('href');
              if (($(this).children('a').attr('href') == window.location) || ($(this).children('a').attr('href') == window.location.pathname)) {
                 $(this).addClass('current-cat');
                 $(this).children('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
                 $(this).parents('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
              }
              if ($(this).children('a').attr('href') == breadLink) {
                 $(this).addClass('current-cat');
                 $(this).parents('.dropdown-category-list').addClass('cat-expanded').siblings('.icon-dropdown').addClass('is-clicked');
                 
              }
           });
                    
            $('.all-categories-list .icon-dropdown').on('click', function() {

                $(this).parent().siblings().removeClass('is-clicked');
                $(this).parent().siblings().find("> .dropdown-category-list").slideUp( "slow" );
                $(this).parent().siblings().find("> .icon-dropdown").removeClass('is-clicked');
                $(this).parent().find("> .dropdown-category-list").slideToggle( "slow" );
                $(this).parent().siblings().removeClass('open');
                if ($(this).hasClass('is-clicked')) {
                    $(this).removeClass('is-clicked');
                    $(this).parent().removeClass('open');
                } else {
                    $(this).addClass('is-clicked');
                    $(this).parent().addClass('open');
                }
           });
        }
    }

    showItem() {
        var total = $('.pagination-wrapper .brand__count').data('total');
        var productPerPage = $('.pagination-wrapper .pagination').data('products');
        var start = 1;
        var end = total;
        var check_link = $(".pagination-wrapper .pagination-item--current").next();
        var checkLastPage = false;
        var lastPage = 1;
        var pageNotLast = lastPage - 1;
        var totalNotLast = pageNotLast * productPerPage;
        var productsLastPage = total - totalNotLast;
        var currentPage = parseInt($('.pagination-wrapper .pagination-item--current > a').text());
        var prevPage = currentPage - 1;

        $('.pagination-wrapper .pagination-info .total').append(total);

        if (check_link.length === 0) {
            lastPage = parseInt($(".pagination-wrapper .pagination-item--current").find("a").text());
            checkLastPage = true;
        } else {
            lastPage = parseInt(check_link.find("a").text());
            checkLastPage = false;
        }
        
        if (total <= productPerPage) {
            $('.pagination-wrapper .pagination-info .start').html(start);
            $('.pagination-wrapper .pagination-info .end').html(end);
        } else {
            if (currentPage <= 1) {
                end = productPerPage;
            } else {
                start = (prevPage * productPerPage) + 1;
                
                if (checkLastPage = true) {
                    end = totalNotLast + productsLastPage;
                } else {
                    end = currentPage * productPerPage;
                }
            }

            $('.pagination-wrapper .pagination-info .start').html(start);
            $('.pagination-wrapper .pagination-info .end').html(end);
        }
    }

    showmore_product() {
        const context = this.context;
        var check_link = $(".pagination-wrapper .pagination-item--current").next();
        if (check_link.length === 0) {
            $('#button-showmore-category').addClass('disable');
        } else {
            $(document).on('click', '#button-showmore-category', function(e){
                e.preventDefault();
                var nextPage = $(".pagination-wrapper .pagination-item--current").next(),
                    link = nextPage.find("a").attr("href");
                $('#button-showmore-category').addClass('loading');
                $.ajax({
                    type: 'get',
                    url: link.replace("http://", "//"),
                    context: this.content,
                    success: function(data) {
                        if ($(data).find('.productGrid').length > 0) {
                            $('.productGrid').append($(data).find('.productGrid').children());
                            $('.pagination-list').html($(data).find(".pagination-list").html());
                            $('#button-showmore-category').removeClass('loading');
                            nextPage = $(".pagination-item--current").next();
                            if (nextPage.length === 0) {
                                $('#button-showmore-category').addClass('disable');
                            }
                           themevale_AddOption(context);
                        }
                    }
                })
            })
        }
    }
}
