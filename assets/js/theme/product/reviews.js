import nod from '../common/nod';
import { CollapsibleEvents } from '../common/collapsible';
import forms from '../common/models/forms';

export default class {
    constructor($reviewForm) {
        this.validator = nod({
            submit: $reviewForm.find('input[type="submit"]'),
        });

        this.$reviewsContent = $('#product-reviews');
        this.$collapsible = $('[data-collapsible]', this.$reviewsContent);

        this.initLinkBind();
        this.injectPaginationLink();
        this.collapseReviews();
        this.reviewInfo();
    }

    /**
     * On initial page load, the user clicks on "(12 Reviews)" link
     * The browser jumps to the review page and should expand the reviews section
     */
    initLinkBind() {
        const $content = $('#productReviews-content', this.$reviewsContent);

        $('.productView-reviewLinkTab > a').on('click', () => {
            event.preventDefault();
            var stickyCartHeight = 0;

            if ($('#sticky_addtocart').is(':visible')) {
                stickyCartHeight = $('#sticky_addtocart').height();
            }
            var height = $('.header').height() + stickyCartHeight + 50;

            if ($('.product-layout-2').length) {
                if (!$('#tab-reviews > .toggle-title > .toggleLink').hasClass('is-open')){
                    $('#tab-reviews > .toggle-title > .toggleLink').trigger('click');
                }
            } else {
                if ($(window).width() > 767) {
                    $('.productView-reviewTabLink').trigger('click');

                } else {
                    if (!$('#tab-reviews > .toggle-title > .toggleLink').hasClass('is-open')){
                        $('#tab-reviews > .toggle-title > .toggleLink').trigger('click');
                    } 
                }
            }            

            $('html, body').animate({
                scrollTop: $('#tab-reviews').offset().top - height,
            }, 700);  
        });
    }

    collapseReviews() {
        // We're in paginating state, do not collapse
        if (window.location.hash && window.location.hash.indexOf('#product-reviews') === 0) {
            var stickyCartHeight = 0;

            if ($('#sticky_addtocart').is(':visible')) {
                stickyCartHeight = $('#sticky_addtocart').height();
            }
            var height = $('.header').height() + stickyCartHeight + 50;

            if ($('.product-layout-2').length) {
                if (!$('#tab-reviews > .toggle-title > .toggleLink').hasClass('is-open')){
                    $('#tab-reviews > .toggle-title > .toggleLink').trigger('click');
                }
            } else {
                if ($(window).width() > 767) {
                    $('.productView-reviewTabLink').trigger('click');
                    
                } else {
                    if (!$('#tab-reviews > .toggle-title > .toggleLink').hasClass('is-open')){
                        $('#tab-reviews > .toggle-title > .toggleLink').trigger('click');
                    }
                }
            }

            $('html, body').animate({
                    scrollTop: $('#tab-reviews').offset().top - height,
            }, 700);

            return;
        }

        // force collapse on page load
        //this.$collapsible.trigger(CollapsibleEvents.click);
    }

    /**
     * Inject ID into the pagination link
     */
    injectPaginationLink() {
        const $nextLink = $('.pagination-item--next .pagination-link', this.$reviewsContent);
        const $prevLink = $('.pagination-item--previous .pagination-link', this.$reviewsContent);

        if ($nextLink.length) {
            $nextLink.attr('href', `${$nextLink.attr('href')} #product-reviews`);
        }

        if ($prevLink.length) {
            $prevLink.attr('href', `${$prevLink.attr('href')} #product-reviews`);
        }
    }

    registerValidation(context) {
        this.context = context;
        this.validator.add([{
            selector: '[name="revrating"]',
            validate: 'presence',
            errorMessage: this.context.reviewRating,
        }, {
            selector: '[name="revtitle"]',
            validate: 'presence',
            errorMessage: this.context.reviewSubject,
        }, {
            selector: '[name="revtext"]',
            validate: 'presence',
            errorMessage: this.context.reviewComment,
        }, {
            selector: '.writeReview-form [name="email"]',
            validate: (cb, val) => {
                const result = forms.email(val);
                cb(result);
            },
            errorMessage: this.context.reviewEmail,
        }]);

        return this.validator;
    }

    validate() {
        return this.validator.performCheck();
    }

    reviewInfo() {
        // Get price
        var price = $('.productView-details .productView-price').html();
        $('.writeReview-productDetails .product-title').after('<div class="productView-price">'+price+'</div>');

        // Get color
        if ($('.productView-details .productView-options [data-product-attribute="swatch"]').length) {               
            var color = $('.productView-details .productView-options [data-product-attribute="swatch"] .form-option > span').attr('title');
            $('.writeReview-productDetails .product-title').append('<span class="color-name">'+color+'</div>');
        }

    }
}
