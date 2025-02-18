import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';

export default function() {
	const product_class = ".card";

	$(document).ready(function() {
         labelSale();
    });
    
    function labelSale() {
        $(product_class).each(function() {
            if ($(this).find('.rrp-price--withoutTax').length || $(this).find('.rrp-price--withTax').length || $(this).find('.non-sale-price--withoutTax').length || $(this).find('.non-sale-price--withTax').length) {
                var priceRetail = parseFloat($(this).find('.price-sale .priceRetail').text());
                var priceP = parseFloat($(this).find('.price-sale .priceP').text());
                var priceSale = parseFloat($(this).find('.price-sale .priceSale').text());

                if( !isNaN(priceRetail) ){
                    priceP = priceRetail;
                }
                
                if( !isNaN(priceP) ){
                   var percent = Math.round(((priceP - priceSale) / priceP * 100).toFixed(1));
                    $(this).find('.sale-badge .text').html("-" + percent + "%");
                } else {
                    $(this).find('.sale-badge').addClass("hide");
                }
            }
        });
    }
}
