import utils from '@bigcommerce/stencil-utils';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory, { showAlertModal } from '../global/modal';
import _ from 'lodash';
import Wishlist from '../wishlist';
import VariantImagesGroup from '../themevale/themevale_additionalProductColors';
import ProductGallery from '../product/gallery';
import themevalePrevNextProduct from '../themevale/themevale_Prev_Next_Product';
import haloAddOptionForProduct from '../themevale/themevale_AddOptionForProduct';
import Sortable from 'sortablejs';

export default class ProductDetails {
    constructor($scope, $scopePrice, context, productAttributesData = {}) {
        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.$scope = $scope;
        this.$scopePrice = $scopePrice;
        this.context = context;
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.initRadioAttributes();
        Wishlist.load(this.context);
        this.getTabRequests();

        if (this.context.themeSettings.themevale_prev_next_product == true) {
            themevalePrevNextProduct();
        }

        if ($('.sold-product').length) {
            this.soldProduct(this.context);
        }
        if ($('.viewing-product').length) {
            this.viewingProduct(this.context);
        }
        if (this.context.themeSettings.show_shipping_tab == true) {
            this.productShippingTab();
        }
        if (this.context.themeSettings.show_custom_tab == true) {
            this.productCustomTab();
        }
        this.viewSizeChart();

        if (this.context.themeSettings.enable_compare_color == true) {
            this.compareColor();
        }

        if (context.themeSettings.enable_complete_the_look == true) {
            if ($('#completeTheLook').length) {
                this.completeTheLook();
            }
        }

        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);
        const hasOptions = $productOptionsElement.html().trim().length;
        const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;

        $productOptionsElement.on('change', event => {
            this.productOptionsChanged(event);
            this.setProductVariant();
            $('.card').find('.quickShopPopup .quickShopWrap').remove();
            $('.card').find('.card-figure').removeClass('has-popup');
        });

        VariantImagesGroup(this.$scope, this.context, $productOptionsElement);
        ProductGallery(this.$scope, this.context, $productOptionsElement);

        $form.on('submit', event => {
            this.addProductToCart(event, $form[0]);
        });

        // add to cart 2
        const $form2 = $('form[data-cart-item-add-2]', $scope);
        const $productOptionsElement2 = $('[data-product-option-change-4]', $form2);
        $productOptionsElement2.on('change', event => {
            this.productOptionsChanged2(event);
            this.setProductVariant2();
        });
		$productOptionsElement2.trigger('change');

        $(document).on('click', '#form-action-addToCart2.themevale', function(event){
            $form2.submit();
        });

        $form2.on('submit', event => {
            this.addProductToCart(event, $form2[0]);
        });

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((_.isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
			const $productId = $('[name="product_id"]', $form).val();

            utils.api.productAttributes.optionChange($productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
				const attributesData = response.data || {};
                const attributesContent = response.content || {};

                this.updateProductAttributes(attributesData);
                if (hasDefaultOptions) {
					this.updateView(attributesData, attributesContent);
                } else {
					this.updateDefaultAttributesForOOS(attributesData);
                }
            });
        } else {
            this.updateProductAttributes(productAttributesData);
			this.showMessageBox(productAttributesData.stock_message || productAttributesData.purchasing_message, productAttributesData.instock, productAttributesData.purchasable, this.$scope);
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];
    }

    /**
     * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
     * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
     * @param formData: FormData object
     * @returns FormData object
     */
    filterEmptyFilesFromForm(formData) {
        try {
            for (const [key, val] of formData) {
                if (val instanceof File && !val.name && !val.size) {
                    formData.delete(key);
                }
            }
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
        return formData;
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];
		
        $.each($('[data-product-option-change] [data-product-attribute]'), (index, value) => {
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

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText;
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    setProductVariant2() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change-4] [data-product-attribute]'), (index, value) => {
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

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText;
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope, $scopePrice) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scopePrice),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scopePrice),
            rrpWithTax: {
                $div: $('.rrp-price--withTax', $scopePrice),
                $span: $('[data-product-rrp-with-tax]', $scopePrice),
            },
            rrpWithoutTax: {
                $div: $('.rrp-price--withoutTax', $scopePrice),
                $span: $('[data-product-rrp-price-without-tax]', $scopePrice),
            },
            nonSaleWithTax: {
                $div: $('.non-sale-price--withTax', $scopePrice),
                $span: $('[data-product-non-sale-price-with-tax]', $scopePrice),
            },
            nonSaleWithoutTax: {
                $div: $('.non-sale-price--withoutTax', $scopePrice),
                $span: $('[data-product-non-sale-price-without-tax]', $scopePrice),
            },
            priceSaved: {
                $div: $('.price-section--saving', $scopePrice),
                $span: $('[data-product-price-saved]', $scopePrice),
            },
            priceNowLabel: {
                $span: $('.price-now-label', $scopePrice),
            },
            priceLabel: {
                $span: $('.price-label', $scopePrice),
            },
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $addToCart2: $('#sticky_addtocart #form-action-addToCart2', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            sku: {
                $label: $('dt.sku-label', $scope),
                $value: $('[data-product-sku]', $scope),
            },
            upc: {
                $label: $('dt.upc-label', $scope),
                $value: $('[data-product-upc]', $scope),
            },
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: $('.productView-info-bulkPricing', $scopePrice),
        };
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};

            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);

           // Change Sticky Add to cart
		   	setTimeout(function(){ 
				let mainImage = $('.js-slider-main .js-slider-main-slides .slider__slide').first().find('.slider__link--image > img').attr('src');

				$('#sticky_addtocart .product-image img').attr('src', mainImage);
			}, 150);

            $.each($('.productView-options [data-product-option-change] [data-product-attribute]'), function(i){
				var el = $(this).find('.form-radio:checked').attr('value');

                $.each($('[data-product-option-change-4] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');

                    if(el == op){
                        $(this).prop('checked', true);

						const $labelTitle = $(`[data-product-attribute-value="${op}"] span`).attr('title');
						const $labelOptionValue = $(this).closest('.form-field').find('[data-option-value]');

						$labelOptionValue.text($labelTitle)
                    }
                })
            });

			var color = $('[data-product-option-change-4] [data-product-attribute="swatch"]').find('.form-radio:checked').next().find('> span').attr('title');

			if (color) {
				let $colorElement = $('#sticky_addtocart .productView-title .color-name');

				if ($colorElement.length) {
					$colorElement.text(' - ' + color);
				} else {
					$('#sticky_addtocart .productView-title').append('<span class="color-name"> - ' + color + '</span>');
				}
			} else {
				$('#sticky_addtocart .productView-title .color-name').remove();
			}
        });
    }

    productOptionsChanged2(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }
        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);

            setTimeout(function(){ 
				let mainImage = $('.js-slider-main .js-slider-main-slides .slider__slide').first().find('.slider__link--image > img').attr('src');

                $('#sticky_addtocart .product-image img').attr('src', mainImage);
            }, 150);
            
            $.each($('[data-product-option-change-4] [data-product-attribute]'), function(i) {
                var el = $(this).find('.form-radio:checked').attr('value');
                $.each($('.productView-options [data-product-option-change] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if(el == op){
                        $(this).prop('checked', true);

						$(this).trigger('change');
						const $labelTitle = $(`[data-product-attribute-value="${op}"] span`).attr('title');
						const $labelOptionValue = $(this).closest('.form-field').find('[data-option-value]');

						$labelOptionValue.text($labelTitle)
                    }
                })
            });

            var color = $('[data-product-option-change-4] [data-product-attribute="swatch"]').find('.form-radio:checked').next().find('> span').attr('title');

			if (color) {
				let $colorElement = $('#sticky_addtocart .productView-title .color-name');

				if ($colorElement.length) {
					$colorElement.text(' - ' + color);
				} else {
					$('#sticky_addtocart .productView-title').append('<span class="color-name"> - ' + color + '</span>');
				}
			} else {
				$('#sticky_addtocart .productView-title .color-name').remove();
			}
        });
    }

    showProductImage(image) {
        if (_.isPlainObject(image)) {
            const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.themeSettings.zoom_size },
                /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.themeSettings.product_size },
                /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data);

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
                mainImageSrcset,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '.increments-product [data-quantity-change] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope, this.$scopePrice);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);
        });

        // Prevent triggering quantity change when pressing enter
        this.$scope.on('keypress', '.form-input--incrementTotal', event => {
            // If the browser supports event.which, then use event.which, otherwise use event.keyCode
            const x = event.which || event.keyCode;
            if (x === 13) {
                // Prevent default
                event.preventDefault();
            }
        });
    }


    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default
        event.preventDefault();

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
            const errorMessage = err || response.data.error;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                return showAlertModal(tmp.textContent || tmp.innerText);
            }

            // Open preview modal and update content
            if (this.previewModal) {
                const options = {
                    template: 'common/cart-preview',
                };

                const $body = $('body');
                const loadingClass = 'is-loading';
                const $cart = $('[data-cart-preview]');
                const $cartDropdown = $('.dropdown-cart');
                const $cartLoading = $('<div class="loadingOverlay"></div>');
                $body.toggleClass('themevale-open-cart');

                if($('.modal-quickview').length) {
                   $('.modal-quickview').foundation('reveal', 'close');
                   $body.removeClass('has-activeModal');
                }

                $cartDropdown
                    .addClass(loadingClass)
                    .html($cartLoading);
                $cartLoading
                    .show();
                utils.api.cart.getContent(options, (err, response) => {
                    $cartDropdown
                        .removeClass(loadingClass)
                        .html(response);
                    $cartLoading
                        .hide();
                    const quantity = $('[data-cart-quantity]').data('cartQuantity') || 0;
                    $body.trigger('cart-quantity-update', quantity);    
                });
                
                $('.themevale_background').on('click', function(e) {
                    if ($body.hasClass('themevale-open-cart')) {
                        $body.removeClass('themevale-open-cart');
                    }
                });

            } else {
                this.$overlay.show();
                // if no modal, redirect to the cart page
                this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
            }
            $('#sticky_addtocart #form-action-addToCart').val(originalBtnVal);
            $('#sticky_addtocart .pop-up-option').removeClass('is-open');
        });
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    getCartContent(cartItemId, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemId,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemId, onComplete) {
        this.getCartContent(cartItemId, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cartQuantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }
        });
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
	 * @param  {Boolean} instock
     */
    showMessageBox(message, instock, purchasable, $scope) {
        const $messageBox = $('.productAttributes-message', $scope);
		const $alertMessage = $('.alertBox-message', $messageBox);

        if (instock) {
			message = this.context.ProductVariantAvailability;
			$messageBox.removeClass('is-unavailable');
        } else {
			message = purchasable ? this.context.ProductVariantSoldOutMessage : this.context.ProductVariantSoldOutNotPurchasableMessage;
			$messageBox.addClass('is-unavailable');
        }

		$alertMessage.text(message);
    }

    /**
     * Hide the pricing elements that will show up only when the price exists in API
     * @param viewModel
     */
    clearPricingNotFound(viewModel) {
        viewModel.rrpWithTax.$div.hide();
        viewModel.rrpWithoutTax.$div.hide();
        viewModel.nonSaleWithTax.$div.hide();
        viewModel.nonSaleWithoutTax.$div.hide();
        viewModel.priceSaved.$div.hide();
        viewModel.priceNowLabel.$span.hide();
        viewModel.priceLabel.$span.hide();
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updatePriceView(viewModel, price) {
		this.clearPricingNotFound(viewModel);
		let $discountElement = $('.js-product-discount', this.$scope);
		$discountElement.removeClass('is-active');

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(addSpaceBeforeNumbers(price.with_tax.formatted));
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(addSpaceBeforeNumbers(price.without_tax.formatted));
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.show();
            viewModel.rrpWithTax.$span.html(addSpaceBeforeNumbers(price.rrp_with_tax.formatted));
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.show();
            viewModel.rrpWithoutTax.$span.html(addSpaceBeforeNumbers(price.rrp_without_tax.formatted));
        }

        if (price.saved) {
            viewModel.priceSaved.$div.show();
            viewModel.priceSaved.$span.html(addSpaceBeforeNumbers(price.saved.formatted));
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithTax.$span.html(addSpaceBeforeNumbers(price.non_sale_price_with_tax.formatted));
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithoutTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithoutTax.$span.html(addSpaceBeforeNumbers(price.non_sale_price_without_tax.formatted));
        }

		if (price.non_sale_price_with_tax && price.with_tax && $discountElement.length) {
			let discountPercentage = Math.round(100 - (price.with_tax.value / price.non_sale_price_with_tax.value * 100));

			$discountElement.each(function() {
				let discountText = $(this).data('text');

				$(this).addClass('is-active');
	
				if (discountText) {
					$(this).text(`-${discountPercentage}% ${discountText}`);
				} else {
					$(this).text(`-${discountPercentage}%`);
				}
			})
		}

		function addSpaceBeforeNumbers(string) {
			return string.replace(/^(\D+)(\d)/, "$1 $2");
		}
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data, content = null) {
        const viewModel = this.getViewModel(this.$scope, this.$scopePrice);
		this.showMessageBox(data.stock_message || data.purchasing_message, data.instock, data.purchasable, this.$scope);

        if (_.isObject(data.price)) {
            this.updatePriceView(viewModel, data.price);
        }

        if (_.isObject(data.weight)) {
            viewModel.$weight.html(data.weight.formatted);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.sku.$value.text(data.sku);
            viewModel.sku.$label.show();
        } else {
            viewModel.sku.$label.hide();
            viewModel.sku.$value.text('');
        }

        // If UPC is available
        if (data.upc) {
            viewModel.upc.$value.text(data.upc);
            viewModel.upc.$label.show();
        } else {
            viewModel.upc.$label.hide();
            viewModel.upc.$value.text('');
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            viewModel.stock.$input.text(data.stock);
        } else {
            viewModel.stock.$container.addClass('u-hiddenVisually');
            viewModel.stock.$input.text(data.stock);
        }

        this.updateDefaultAttributesForOOS(data);

        // If Bulk Pricing rendered HTML is available
        if (data.bulk_discount_rates && content) {
            viewModel.$bulkPricing.html(content);
        } else if (typeof (data.bulk_discount_rates) !== 'undefined') {
            viewModel.$bulkPricing.html('');
        }

        const addToCartWrapper = $('#add-to-cart-wrapper');

        if (addToCartWrapper.is(':hidden') && data.purchasable) {
        addToCartWrapper.show();
        }
    }

    updateDefaultAttributesForOOS(data) {
        const viewModel = this.getViewModel(this.$scope, this.$scopePrice);
        // Fabio custom start
        const $walletButtons = $('div.wallet-buttons-list');
        // Fabio custom end
		
        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$addToCart2.prop('disabled', true);
            viewModel.$increments.prop('disabled', true);
            // Fabio custom start
            $walletButtons.hide();
            // Fabio custom end
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$addToCart2.prop('disabled', false);
            viewModel.$increments.prop('disabled', false);
            // Fabio custom start
            $walletButtons.show();
            // Fabio custom end
        }
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('productAttributeValue'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
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

    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.prop('disabled', false);
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('productAttribute') : null;
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
            const $radio = $(radio);

            // Only bind to click once
            if ($radio.attr('data-state') !== undefined) {
                $radio.on('click', () => {
                    if ($radio.data('state') === true) {
                        $radio.prop('checked', false);
                        $radio.data('state', false);

                        $radio.trigger('change');
                    } else {
                        $radio.data('state', true);
                    }

                    this.initRadioAttributes();
                });
            }

            $radio.attr('data-state', $radio.prop('checked'));
        });
    }

    /**
     * Check for fragment identifier in URL requesting a specific tab
     */
    getTabRequests() {
        if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
            const $activeTab = $('.tabs').has(`[href='${window.location.hash}']`);
            const $tabContent = $(`${window.location.hash}`);

            if ($activeTab.length > 0) {
                $activeTab.find('.tab')
                    .removeClass('is-active')
                    .has(`[href='${window.location.hash}']`)
                    .addClass('is-active');

                $tabContent.addClass('is-active')
                    .siblings()
                    .removeClass('is-active');
            }
        }
    }

    sugguestProductsCarousel() {
        if ($('.suggestiveCart .productGrid .product').length > 0) {
            $('.suggestiveCart .productGrid').slick({
                dots: false,
                arrows: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                mobileFirst: true,
                infinite: true
            });
        }
    }

    soldProduct() {
        var numbersProductS = this.context.themeSettings.number_products;
        var numbersProductList =  JSON.parse("[" + numbersProductS+ "]"); 
        var numbersProductItem = (Math.floor(Math.random()*numbersProductList.length));
        var numbersProduct = numbersProductList[numbersProductItem];

        var numbersHoursS = this.context.themeSettings.number_hours;
        var numbersHoursList =  JSON.parse("[" + numbersHoursS + "]");
        var numbersHoursItem = (Math.floor(Math.random()*numbersHoursList.length));
        var numbersHour = numbersHoursList[numbersProductItem];
     
        var itemPrdsText = this.context.themeSettings.number_products_text;
        var itemHoursText = this.context.themeSettings.number_hours_text;
  
        $('.sold-product').html('<svg class="icon"><use xlink:href="#icon-fire"></use></svg> <span>' + numbersProduct + " " + itemPrdsText + " " + numbersHour + " " + itemHoursText + '</span>');
        $('.sold-product').show();
    }

    viewingProduct() {
        var ViewerText = this.context.themeSettings.themevale_viewingProduct_text;
        var numbersViewer_text = this.context.themeSettings.themevale_viewingProduct_viewer;
        var numbersViewerList =  JSON.parse("[" + numbersViewer_text + "]"); 
        
        setInterval(function() {
            var numbersViewerItem = (Math.floor(Math.random()*numbersViewerList.length));

            $('.viewing-product').html('<svg class="icon"><use xlink:href="#icon-view"/></svg>' + numbersViewerList[numbersViewerItem] + " " + ViewerText);
            $('.viewing-product').show();
        }, 10000);
  
    }

    productShippingTab() {
        var link_page = this.context.themeSettings.shipping_tab_link;
        $.ajax({
           url:link_page,
           type:'GET',
           success: function(data){
                var content = $(data).find('.page-content').html();
                $('#tab-shipping-content').html(content);
           }
        });
    }
    productCustomTab() {
        if ($('.productView-description #tab-description .custom-tab').length ) {
            $('.productView-description .tabs .custom_tab').show();
            $('.productView-description #tab-description .custom-tab').appendTo('.productView-description #tab-custom-content');
        }
    }

    productSustainabilityTab() {
        $('.productView-description .tabs .sustainability_tab').show();
    };
  
    productRessourcesTab() {
        $('.productView-description .tabs .ressources_tab').show();
    };
  
    viewSizeChart() {
        if ($('[data-product-option-change] [data-product-attribute]').length) {
            $('[data-product-option-change] [data-product-attribute]').each(function(){
                var smallText = $(this).find('.form-label small').text();
                var label = $(this).find('.form-label').text().replace(smallText, '').trim().toLowerCase();
                var size = $(this).find('.form-label');
                if(label == 'size') {
                    size.addClass('hasSizeChart');
                    $('[data-product-option-change] .size-chart').appendTo('.hasSizeChart');
                    $('.hasSizeChart .size-chart').show();
                }
            })            
        }
    }

    compareColor() {
        if ($('.productView-details [data-product-option-change] [data-product-attribute="swatch"]').length > 0 && $('.productView-details [data-product-option-change] [data-product-attribute="swatch"] .form-option-swatch').length > 1) {
            $('.productView-images .compare-color').css('display','inline-block');
        }

        jQuery(document).on('click', '.compareColor-link',  function(e){
            var productId = $('.productView-details .productView-options form [name="product_id"]').val();
            var color = $('.productView-details [data-product-option-change] [data-product-attribute="swatch"]').html();
            $('.productView-details [data-product-attribute="swatch"] .form-option').each(function(){
                var id= $(this).attr('data-product-attribute-value');
                var numbers = Math.floor((Math.random() * 10) + 1);
                color = color.replace('for="attribute_swatch', 'for="'+numbers+'_attribute_swatch');
            }); 

            if ($('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').length <=0) {
                $('.themevaleCompareColor .compareColor-swatch').append('<div data-product-option-change5=""><div id="sortable" class="form-field color" data-product-attribute="swatch">'+color+'</div></div>');
            }

            $('.themevaleCompareColor [data-product-attribute="swatch"] .form-radio').each(function(){
                if ($(this).is(':checked')) {
                    $(this).prop("checked", false);
                } 
            });
            jQuery(document).on('click', '.modal-background',  function(e){
                $('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').remove();
                $('#color-swatch-image .item').remove();
            });
        });

        jQuery(document).on('click', '.compareColor-swatch .form-option',  function(e){
            $(this).toggleClass('show');
            var id= $(this).data('product-attribute-value');
            var title = $(this).find('.form-option-variant').attr('title');

            if ($(this).hasClass('show')) {
                if ($(this).find('.form-option-variant[data-img-src]').length) {
                    var img = $(this).find('.form-option-variant').data('img-src');
                    $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-'+id+'"><img src="'+img+'" alt=""><span class="title">'+title+'</span></div>');
                } else {
                    var color = $(this).find('.form-option-variant').data('color');
                    var color_1 = '';
                    var color_2 = '';

                    if ($(this).find('.form-option-variant').hasClass('three-colors')) {
                        color_1 = $(this).find('.form-option-variant:nth-child(2)').data('color-1');
                        color_2 = $(this).find('.form-option-variant:last-child').data('color-2');
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color three-colors '+ title +'"><span class="color-0" style="background:'+color+';"></span><span class="color-1" style="background:'+color_1+';"></span><span class="color-2" style="background:'+color_2+';"></span></div><span class="title">'+title+'</span></div>');
                    }

                    if ($(this).find('.form-option-variant').hasClass('two-colors')) {
                        color_1 = $(this).find('.form-option-variant:last-child').data('color-1');
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color two-colors '+ title +'"><span class="color-0" style="background:'+color+';"></span><span class="color-1" style="background:'+color_1+';"></span></div><span class="title">'+title+'</span></div>');
                    }

                    if ($(this).find('.form-option-variant').hasClass('one-color')) {
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color one-color '+ title +'"><span class="color-0" style="background:'+color+';"></span></div><span class="title">'+title+'</span></div>');
                    }
                }
            } else {
                $('.themevaleCompareColor .color-swatch-image .item-'+id+'').remove();
            }

            if ($(window).width() > 1024) {
                var el = document.getElementById('color-swatch-image');
                new Sortable(el, {
                    animation: 150
                });
            }
            
        });

        jQuery(document).on('click', '#compare-color-popup .modal-close',  function(e){
            $('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').remove();
            $('#color-swatch-image .item').remove();
        });

    }

    // Complete The Look on Product Page */
    completeTheLook() {
        var type = this.context.themeSettings.complete_the_look_type;
        
        if (type == 'same') {
            var productIDS = this.context.themeSettings.complete_the_look_ids;
            var listIDs = JSON.parse("[" + productIDS + "]");
            this.completeTheLookView(listIDs);
        } else if ($('.productView-info-value.ctl-product').length > 0) {
            var num = 0;
            var listIDs = [];
            var productIDS = $('.productView-info-value.ctl-product').text();
            var listIDs = JSON.parse("[" + productIDS + "]");

            this.completeTheLookView(listIDs);
        } else {
            $('#completeTheLook').remove();
        }
    }

    /*completeTheLookView(listIDs) {
        const $prodWrap = $('#completeTheLook .productGrid');
        const mainProductId = $('.productView-details .productView-product > .productView-title').data('product-id');

        $prodWrap.empty();

        for (var i = 0; i < listIDs.length; i++) {
            var productId = listIDs[i];

            if (productId != mainProductId) {
                utils.api.product.getById(productId, { 
                    template: {
                        lookItem: 'themevale/complete-the-look-item',
                        option: 'themevale/themevale_AddOptionForProduct'
                    }
                }, (err, response) => {
                    var responseLookItem = response.lookItem;
                    var responseOption = response.option;

                    var $proID = $(responseLookItem).find('.product').data('product-id');
                    var $thisPro = $(responseLookItem).find('.product[data-product-id='+$proID+']');

                    if($prodWrap.hasClass('slick-initialized')) {
                        $prodWrap.slick('unslick');
                        $prodWrap.append($thisPro);
                    } else {
                        $prodWrap.append($thisPro);
                    }

                    var a = arrNew2.indexOf($proID);

                    if( a != -1){                       
                        $thisPro.find('.card-figure').prepend('<div class="product-badge new-badge"><span class="text">New</span></div>');
                    }

                    this.completeTheLookCarousel($prodWrap);

                    // if($prodWrap.find('.product').length === listIDs.length){
                        var block_id = 'block-complete-the-look';
                        haloAddOptionForProduct(this.context, block_id);
                    // }
                }); 
            }
        }

        $('#completeTheLook').addClass('show');  
    }*/

/* CUSTOM CODE FABIO - complete the look with promise for fixed sort order */
  completeTheLookView(listIDs) {
    const $completeTheLookContainer = $('#completeTheLook');
    const $prodWrap = $completeTheLookContainer.find('.productGrid');
    const mainProductId = $('.productView-details .productView-product > .productView-title').data('product-id');

    $prodWrap.empty();
    $completeTheLookContainer.hide(); // Initially hide the entire container

    const productPromises = listIDs.map(productId => {
        if (productId !== mainProductId) {
            return new Promise((resolve, reject) => {
                utils.api.product.getById(productId, { 
                    template: {
                        lookItem: 'themevale/complete-the-look-item',
                        option: 'themevale/themevale_AddOptionForProduct'
                    }
                }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.lookItem);
                    }
                });
            });
        }
        return null;
    }).filter(promise => promise !== null);

    Promise.all(productPromises).then(responses => {
        responses.forEach(responseLookItem => {
            const $thisPro = $(responseLookItem).find('.product');
            $prodWrap.append($thisPro);
        });

        this.completeTheLookCarousel($prodWrap);
        $completeTheLookContainer.show(); // Show the container after all products are loaded
    }).catch(error => {
        console.error('Error fetching products:', error);
    });
  }
/* END CUSTOM CODE FABIO */

    completeTheLookCarousel($prodWrap) {
        $prodWrap.slick({
            dots: true,
            arrows: false,
            slidesToShow: 5,
            slidesToScroll: 5,
            mobileFirst: true,
            infinite: false,
            adaptiveHeight: false,
            responsive: [
            {
              breakpoint: 1440,
              settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
              }
            },
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
              }
            },
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
              }
            },
            {
                breakpoint: 280,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2,
                }
              }
          ]
        });
    }
}
