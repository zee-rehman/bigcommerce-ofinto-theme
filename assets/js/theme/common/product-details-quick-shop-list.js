import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import { hooks } from '@bigcommerce/stencil-utils';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from '../global/modal';
import swal from '../global/sweet-alert';

// We want to ensure that the events are bound to a single instance of the product details component
let productSingleton = null;

export default function() {

    const modal = defaultModal();
    const $ajaxcart_option = $(".btn-quickShopList");
    const $product = $('.card');
    var j, count = 0,
        qty = 0;
    listenQuantityChange();
        
    $(document).ready(function() {

        callProductOption();
        

        $(document).on('click', 'a.btn-quickShopList', function(event) {
            var $target = $(event.currentTarget);
            const product_id = $target.data('product-id');
            const $el = $target.parents('.card').find(`#data-product-qty-${product_id}`);
            const oldQty = parseInt($el.val(), 10);
            const $attributes = $(`.data-product-option-${product_id}`);
            qty = 0;
            event.preventDefault();
            var check = true;

            if (oldQty > 0) {
                var data = { "action": "add", "fastcart": "1" }
                data["product_id"] = product_id;
                data["qty[]"] = oldQty;
                check = checkBeforeAdd(data);
                if (check == true) {
                    qty = oldQty;

                    addToCart(data, true);
                } else {
                    alert("Bitte wählen Sie eine Option aus/Please select an option");
                }
            } else {
                alert("Bitte geben Sie eine gültige Menge an/Please enter a valid quantity");
            }
        });

        $(document).on('change', '[data-product-option-change2]', event => {
            event.preventDefault();
            productOptionsChanged(event);
            setProductVariant();
        });
    });

    function checkBeforeAdd(data) {

        const product_id = data.product_id;
        const $el = $(`#data-product-qty-${product_id}`);
        const oldQty = parseInt($el.val(), 10);
        const $attributes = $(`.data-product-option-${product_id}`).parents('.card');
        var check = true;

        $attributes.find('input:text, input:password, input:file, select, textarea').each(function() {

            if (!$(this).prop('required')) {
                data[$(this).attr("name")] = $(this).val();
            } else {
                if ($(this).val()) {
                    data[$(this).attr("name")] = $(this).val();
                } else {
                    $(this).focus();
                    check = false;
                }
            }
        });

        var att = "";
        $attributes.find('input:radio, input:checkbox').each(function() {
            if (att != $(this).attr("name")) {

                att = $(this).attr("name");
                if (!$(this).prop('required')) {
                    if ($(this).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the checkbox is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        }
                    }
                    if ($(this).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the radio is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        }
                    }
                } else {
                    if ($(this).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the checkbox is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        } else {
                            check = false;
                        }
                    }
                    if ($(this).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the radio is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        } else {
                            check = false;
                        }
                    }
                }
                var title = $("[name='" + att + "']:checked").next().children().text();
                if (title == "") {
                    title = $("[name='" + att + "']:checked").next().children().first().attr('title');
                }
            }
        });
        return check;
    }

    function addToCart(data, add_single_to_cart) {
        const product_id = data.product_id;
        const $el = $(`#data-product-qty-${product_id}`);

        if (add_single_to_cart == true) {

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

                $el.val(1);
                getCart(qty, response.data.cart_item.hash);
            });
        } 
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

    function callProductOption() {
        $.each($ajaxcart_option, function(key, value) {
            var productId = $(this).data('productId');
            if (productId != undefined) {
                if ($(this).parents('.card').find('.productOptionList [data-product-option-change2]').length <=0) {
                    utils.api.product.getById(productId, { template: 'themevale/quick_shop_options_list' }, (err, response) => {
                        var data_option = $('[data-product-option-change2]', response).html();
                        var quantity = $('.form-field--increments', response).html();

                        data_option = data_option.replace(new RegExp(escapeRegExp("attribute_"), 'g'), "attribute_" + productId + "_");
                        data_option = data_option.replace(new RegExp(escapeRegExp("attribute_" + productId + "_value_images"), 'g'),"attribute_value_images");
                        $(".productOptionList.product-option-" + productId).append("<div data-product-option-change2>" + data_option + "</div>");
                       
                        if ($(this).parents('.card').find('.card-figcaption-list .form-field--increments .form-increment').length <=0) {
                            $(".card[data-product-id="+productId+"]").find('.form-field--increments').append(quantity);
                        }

                        $(".card[data-product-id="+productId+"] [data-product-option-change2] [data-product-attribute='swatch']").each(function(index, el){
                            var title = $(el).find('.form-radio:checked + .form-option > span').attr('title');
                            $(el).find('[data-option-value]').text(title);
                        });

                        $(".card[data-product-id="+productId+"] [data-product-option-change2] [data-product-attribute='set-rectangle']").each(function(index, el){
                            var title = $(el).find('.form-radio:checked + .form-option > span').text();
                            $(el).find('[data-option-value]').text(title);
                        });

                        $(".card[data-product-id="+productId+"] [data-product-option-change2] [data-product-attribute='set-radio']").each(function(index, el){
                            var title = $(el).find('.form-radio:checked + .form-label').text();
                            $(el).find('[data-option-value]').text(title);
                        });

                        $(".card[data-product-id="+productId+"] [data-product-option-change2] [data-product-attribute='set-select']").each(function(index, el){
                            var title = $(el).find('option[selected]').text();
                            $(el).find('[data-option-value]').text(title);
                        });
                    });
                }
            }
        });

    }

    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /**
     *
     * Handle product options changes
     *
     */
    function productOptionsChanged(event) {
        const $changedOption = $(event.currentTarget);
        const $scope = $changedOption.parents(".card");
        const productId = $scope.attr("data-product-id");
        
        if (productId == undefined) {
            return;
        }

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }
        var data = { "action": "add" }
        data["product_id"] = productId;

        $scope.find('input:text, input:password, input:file, select, textarea').each(function() {

            data[$(this).attr("name")] = $(this).val();

        });

        var att = "";

        $scope.find('input:radio, input:checkbox').each(function() {
            if (att != $(this).attr("name")) {
                att = $(this).attr("name");
                if ($(this).attr("name") != "products[]") {
                    if ($(this).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the checkbox is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        }
                    }
                    if ($(this).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) { // check if the radio is checked
                            data[$(this).attr("name")] = $("[name='" + att + "']:checked").val();
                        }
                    }
                }
            }
        });

        data["qty[]"] = $("#data-product-qty-" + productId).val();

        utils.api.productAttributes.optionChange(productId, data, (err, response) => {
            const productAttributesData = response.data || {};
            //updateProductAttributes(productAttributesData, $scope);
            //updateView(productAttributesData, $scope);
        });
    }

    function setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change2] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);
                    $(value.children[0]).find('[data-option-value]').text(select.options[selectedIndex].innerText);
                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        const label = checked.labels[0].innerText;
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                            $(value.children[0]).find('[data-option-value]').text(label);
                        }
                    }

                    if (type === 'swatch') {
                        const label = checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                            $(value.children[0]).find('[data-option-value]').text(label.title);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

       
    }
    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    function updateProductAttributes(data, $scope) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = `(${data.out_of_stock_message})`;

        showProductImage(data.image, $scope);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', $scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('product-attribute-value'), 10);

            if (inStockIds.indexOf(attrId) !== -1) {
                enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    function enableAttribute($attribute, behavior, outOfStockMessage) {
        if (getAttributeType($attribute) === 'set-select') {
            return enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    function enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.prop('disabled', false);
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    function disableAttribute($attribute, behavior, outOfStockMessage) {
        if (getAttributeType($attribute) === 'set-select') {
            return disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    function getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');
        return $parent ? $parent.data('productAttribute') : null;
    }

    function disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parent();

        if (behavior === 'hide_option') {
            $attribute.toggleOption(false);
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($select.val() === $attribute.attr('value')) {
                $select[0].selectedIndex = 0;
            }
        } else {
            $attribute.attr('disabled', 'disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    function updateView(data, $scope) {
        const viewModel = getViewModel($scope);

        //this.showMessageBox(data.stock_message || data.purchasing_message);

        if ((typeof data.price === "object") && (data.price !== null)) {
            updatePriceView(viewModel, data.price);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.$sku.text(data.sku);
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            viewModel.stock.$input.text(data.stock);
        }

        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$increments.prop('disabled', true);
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$increments.prop('disabled', false);
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    function updatePriceView(viewModel, price) {
        if (price.with_tax) {
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
        }

        if (price.rrp_with_tax) {
            viewModel.$rrpWithTax.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.$rrpWithoutTax.html(price.rrp_without_tax.formatted);
        }
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    function getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $rrpWithTax: $('[data-product-rrp-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            $rrpWithoutTax: $('[data-product-rrp-without-tax]', $scope),
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]'),
            quantity: {
                $text: $('.form-input--incrementTotal', $scope),
                $input: $('[name=data-product-qty]', $scope),
            },

        };
    }

    function showProductImage(image, $scope) {
        if ((typeof image === "object") && (image !== null)) {
            //alert(image.data);

        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    function listenQuantityChange() {
        $('.card-figcaption-list').unbind().on('click', ' [data-quantity-change] button', function(event) {
            const $target = $(event.target);
            const itemId = $target.data('item-id');
            const $el = $target.parent().find(`#data-product-qty-${itemId}`);
            const qty = parseInt($el.val(), 10);
            const maxQty = parseInt($el.data('quantityMax'), 10);
            const minQty = parseInt($el.data('quantityMin'), 10);
            const minError = $el.data('quantityMinError');
            const minError1 = $el.data('quantityMinError1');
            const maxError = $el.data('quantityMaxError');
            const newQty = $target.data('action') === 'inc' ? qty + 1 : qty - 1;
            const prod = $target.parents('.card');
            event.preventDefault();

            if (minQty > 0) {
                if (newQty < minQty) {
                    return swal.fire({
                        text: minError,
                        icon: 'error',
                    });
                } else if (maxQty > 0 && newQty > maxQty) {
                    return swal.fire({
                        text: maxError,
                        icon: 'error',
                    });
                }
            } else {
                if ((newQty - 1) < minQty) {
                    return swal.fire({
                        text: minError1,
                        icon: 'error',
                    });
                } else if (maxQty > 0 && newQty > maxQty) {
                    return swal.fire({
                        text: maxError,
                        icon: 'error',
                    });
                }
            }
            $el.val(newQty);
        });

        $(document).on('keypress', '.form-input--incrementTotal', event => {
            // If the browser supports event.which, then use event.which, otherwise use event.keyCode
            const x = event.which || event.keyCode;
            if (x === 13) {
                // Prevent default
                event.preventDefault();
            }
        });
    }
}
