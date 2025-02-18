import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import { defaultModal } from '../global/modal';

// We want to ensure that the events are bound to a single instance of the product details component
let productSingleton = null;


export default function (context) {

    const modal = defaultModal();

    const $ajaxcart = $("a.themevale_btnATC");
    const $content = $('<div class="modal-body quickView"></div>');
    var j, count = 0, error = 0, qty = 0;
    var list_product = "";

    $(document).ready(function() {

        $('body').on('click', '.themevale_btnATC', (event) => {

            event.preventDefault();
            var pro;
            qty = 0;
            const productId = $(event.currentTarget).data('product-id');
            pro = { "action": "add", "fastcart": "1", "product_id": productId, "qty[]": "1" };
            qty += 1;
            error = 0;
            addToCart(pro);
        });

        function addToCart(data) {
            const product_id = data.product_id;
            const $el = $(`#data-product-qty-${product_id}`);
            
            var form_data = new FormData();
            for (var key in data) {
                form_data.append(key, data[key]);
            }
            
            // Add item to cart
            utils.api.cart.itemAdd(form_data, (err, response) => {
                const errorMessage = err || response.data.error;

                // Guard statement
                if (errorMessage) {
                    // Strip the HTML from the error message
                    const tmp = document.createElement('DIV');
                    tmp.innerHTML = errorMessage;
                    return alert(tmp.textContent || tmp.innerText);
                }
                getCart(qty, response.data.cart_item.hash);
            });
        }


        function getCart(qty, cartItemHash) {
            const options = {
                template: 'common/cart-preview',
                params: {
                    suggest: cartItemHash,
                },
            };

            const $body = $('body');
            const $cartDropdown = $('#cart-preview-dropdown');
            const loadingClass = 'is-loading';
            const $cartLoading = $('<div class="loadingOverlay"></div>');

            $body.toggleClass('themevale-open-cart');
            $cartDropdown
                .addClass(loadingClass)
                .html($cartLoading);
            $cartLoading
                .show();

            utils.api.cart.getContent(options, (err, response) => {
                if (err) {
                    return;
                }

                $cartDropdown
                .removeClass(loadingClass)
                .html(response);
                $cartLoading
                    .hide();

                // Update cart counter           
                const quantity = $('[data-cart-quantity]').data('cartQuantity') || 0;
                $body.trigger('cart-quantity-update', quantity);   
            });
            
            $('.themevale_background').on('click', function(e) {
                if ($body.hasClass('themevale-open-cart')) {
                    $body.removeClass('themevale-open-cart');
                }
            });
        }

    });

}
