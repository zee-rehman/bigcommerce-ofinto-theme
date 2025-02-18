import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import FacetedSearch from './common/faceted-search';
import compareProducts from './global/compare-products';
import urlUtils from './common/url-utils';
import Url from 'url';
import collapsibleFactory from './common/collapsible';
import 'jstree';
import nod from './common/nod';
import productDisplayMode from './themevale/productDisplayMode';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';
import themevaleStickyCategoryFilter from './themevale/themevale_stickyCategoryFilter';

export default class Search extends CatalogPage {
    constructor(context) {
        super(context);
    }
    formatCategoryTreeForJSTree(node) {
        const nodeData = {
            text: node.data,
            id: node.metadata.id,
            state: {
                selected: node.selected,
            },
        };

        if (node.state) {
            nodeData.state.opened = node.state === 'open';
            nodeData.children = true;
        }

        if (node.children) {
            nodeData.children = [];
            node.children.forEach((childNode) => {
                nodeData.children.push(this.formatCategoryTreeForJSTree(childNode));
            });
        }

        return nodeData;
    }
    loadOptionForProductCard(context){
        if($('#featured-products .card').length > 0){
            themevale_AddOption(context, 'featured-products');
        }

        if($('#product-listing-container .product').length > 0){
            themevale_AddOption(context, 'product-listing-container');
        }
    }
    showProducts(navigate = true) {
        this.$productListingContainer.removeClass('u-hiddenVisually');
        this.$facetedSearchContainer.removeClass('u-hiddenVisually');
        this.$contentResultsContainer.addClass('u-hiddenVisually');

        $('[data-content-results-toggle]').removeClass('navBar-action-color--active');
        $('[data-content-results-toggle]').addClass('navBar-action');

        $('[data-product-results-toggle]').removeClass('navBar-action');
        $('[data-product-results-toggle]').addClass('navBar-action-color--active');

        if (!navigate) {
            return;
        }

        const searchData = $('#search-results-product-count span').data();
        const url = (searchData.count > 0) ? searchData.url : urlUtils.replaceParams(searchData.url, {
            page: 1,
        });

        urlUtils.goToUrl(url);
    }

    showContent(navigate = true) {
        this.$contentResultsContainer.removeClass('u-hiddenVisually');
        this.$productListingContainer.addClass('u-hiddenVisually');
        this.$facetedSearchContainer.addClass('u-hiddenVisually');

        $('[data-product-results-toggle]').removeClass('navBar-action-color--active');
        $('[data-product-results-toggle]').addClass('navBar-action');

        $('[data-content-results-toggle]').removeClass('navBar-action');
        $('[data-content-results-toggle]').addClass('navBar-action-color--active');

        if (!navigate) {
            return;
        }

        const searchData = $('#search-results-content-count span').data();
        const url = (searchData.count > 0) ? searchData.url : urlUtils.replaceParams(searchData.url, {
            page: 1,
        });

        urlUtils.goToUrl(url);
    }

    onReady() {
        compareProducts(this.context.urls);

        const $searchForm = $('[data-advanced-search-form]');
        const $categoryTreeContainer = $searchForm.find('[data-search-category-tree]');
        const url = Url.parse(window.location.href, true);
        const treeData = [];
        this.$productListingContainer = $('#product-listing-container');
        this.$facetedSearchContainer = $('#faceted-search-container');
        this.$contentResultsContainer = $('#search-results-content');

        // Themevale Function
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

        // Init faceted search
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Init collapsibles
        collapsibleFactory();

        $('[data-product-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showProducts();
        });

        $('[data-content-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showContent();
        });

        if (this.$productListingContainer.find('li.product').length === 0 || url.query.section === 'content') {
            this.showContent(false);
        } else {
            this.showProducts(false);
        }

        const validator = this.initValidation($searchForm)
            .bindValidation($searchForm.find('#search_query_adv'));

        this.context.categoryTree.forEach((node) => {
            treeData.push(this.formatCategoryTreeForJSTree(node));
        });

        this.categoryTreeData = treeData;
        this.createCategoryTree($categoryTreeContainer);

        $searchForm.on('submit', event => {
            const selectedCategoryIds = $categoryTreeContainer.jstree().get_selected();

            if (!validator.check()) {
                return event.preventDefault();
            }

            $searchForm.find('input[name="category\[\]"]').remove();

            for (const categoryId of selectedCategoryIds) {
                const input = $('<input>', {
                    type: 'hidden',
                    name: 'category[]',
                    value: categoryId,
                });

                $searchForm.append(input);
            }
        });
    }

    loadTreeNodes(node, cb) {
        $.ajax({
            url: '/remote/v1/category-tree',
            data: {
                selectedCategoryId: node.id,
                prefix: 'category',
            },
            headers: {
                'x-xsrf-token': window.BCData && window.BCData.csrf_token ? window.BCData.csrf_token : '',
            },
        }).done(data => {
            const formattedResults = [];

            data.forEach((dataNode) => {
                formattedResults.push(this.formatCategoryTreeForJSTree(dataNode));
            });

            cb(formattedResults);
        });
    }

    createCategoryTree($container) {
        const treeOptions = {
            core: {
                data: (node, cb) => {
                    // Root node
                    if (node.id === '#') {
                        cb(this.categoryTreeData);
                    } else {
                        // Lazy loaded children
                        this.loadTreeNodes(node, cb);
                    }
                },
                themes: {
                    icons: true,
                },
            },
            checkbox: {
                three_state: false,
            },
            plugins: [
                'checkbox',
            ],
        };

        $container.jstree(treeOptions);
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $contentListingContainer = $('#search-results-content');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $searchHeading = $('#search-results-heading');
        const $searchCount = $('#search-results-product-count');
        const $contentCount = $('#search-results-content-count');
        const productsPerPage = this.context.searchProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'search/product-listing',
                contentListing: 'search/content-listing',
                sidebar: 'search/sidebar',
                heading: 'search/heading',
                productCount: 'search/product-count',
                contentCount: 'search/content-count',
            },
            config: {
                product_results: {
                    limit: productsPerPage,
                },
            },
            showMore: 'search/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $searchHeading.html(content.heading);

            const url = Url.parse(window.location.href, true);
            if (url.query.section === 'content') {
                $contentListingContainer.html(content.contentListing);
                $contentCount.html(content.contentCount);
                this.showContent(false);
            } else {
                $productListingContainer.html(content.productListing);
                $facetedSearchContainer.html(content.sidebar);
                $searchCount.html(content.productCount);
                this.showProducts(false);
            }

            $('body').triggerHandler('compareReset');

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

    initValidation($form) {
        this.$form = $form;
        this.validator = nod({
            submit: $form,
        });

        return this;
    }

    bindValidation($element) {
        if (this.validator) {
            this.validator.add({
                selector: $element,
                validate: 'presence',
                errorMessage: $element.data('errorMessage'),
            });
        }

        return this;
    }

    check() {
        if (this.validator) {
            this.validator.performCheck();
            return this.validator.areAll('valid');
        }

        return false;
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

    showItem() {
        var total = $('.pagination-wrapper .search__count').data('total');
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
        $('.pagination-info .total').append(total);
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
}
