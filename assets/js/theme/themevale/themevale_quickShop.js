import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import swal from '../global/sweet-alert';
import _ from 'lodash';
import modalFactory, { showAlertModal } from '../global/modal';
import ProductDetailsQuickShop from '../common/product-details-quick-shop';
import ProductDetailsQuickShopList from '../common/product-details-quick-shop-list';
import { defaultModal } from '../global/modal';

export default function(context) {
    const product_class = ".card";
    const previewModal = modalFactory('#previewModal')[0];

    quickShop();

    function quickShop() {
        jQuery(document).on('click', '.btn-quickShop',  function(event){
            var $target = $(event.currentTarget);
            var $product = $target.parents('.card');
            var productId = $target .data('product-id');
            event.preventDefault();
            $product.find('.quickShopPopup').append('<div class="loadingOverlay" style="display:block;"></div>');
            $(product_class).find('.card-figure').removeClass('has-popup');
            $(product_class).find('.quickShopPopup .quickShopWrap').remove();
            $product.find('.card-figure').addClass('has-popup');

            if ($("#sticky_addtocart .pop-up-option").hasClass("is-open")) {
                $("#sticky_addtocart .pop-up-option").removeClass("is-open");
                $('#sticky_addtocart .choose_options_add').removeClass('is-active');
            }

            utils.api.product.getById(productId, { template: 'themevale/quick_shop_options' }, (err, response) => {
                $product.find('.quickShopPopup').find('.loadingOverlay').remove();      
                $product.find('.quickShopPopup .themevale_close').css('display','block');
                $product.find('.quickShopPopup').append(response);
                return new ProductDetailsQuickShop($product.find('.quickShopPopup .quickShopWrap'), context);
            });
        });

        $(document).on('click','.quickShopPopup .themevale_close', function(e) {
            $(this).parents('.card-figure').removeClass('has-popup');
            $(product_class).find('.quickShopPopup .quickShopWrap').remove();

        });

        $('#list-view').on('click', function() {
            $(product_class).find('.quickShopPopup .quickShopWrap').remove();
            $(product_class).find('.card-figure').removeClass('has-popup');

            if ($('.productListing.productList').length <= 0) {
                ProductDetailsQuickShopList();
            }
        });

        if ($('.productListing.productList').length > 0) {
            ProductDetailsQuickShopList();
        }

        $('#grid-view').on('click', function() {
           $(product_class).find('.productOptionList [data-product-option-change2]').remove();
           $(product_class).find('.card-figcaption-list .form-field--increments').children().remove();

        });
    }   
}
