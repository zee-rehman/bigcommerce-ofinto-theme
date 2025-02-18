import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';

export default function (themeSettings, free_shipping_message = '', countryCode = '') {
    if (themeSettings.themevale_CalculateFreeShipping == false) return false;
   
    const options = {
        template: {
            pageTitle: 'cart/page-title',
            statusMessages: 'cart/status-messages',
        },
    };
    var shopperCurrency;
    var previewCart = "";
    var is_exist_100 = false, max_percent = 0;
    var shipping_message = free_shipping_message[0];

    $.ajax({
        type: "GET",
        url: '/api/storefront/checkout-settings',
        headers: {
            "Accept": "application/vnd.bc.v1+json",
            "X-API-INTERNAL": "This API endpoint is for internal use only and may change in the future"
        },
        success: function(response){
            if( response ){
                shopperCurrency = response.storeConfig.shopperCurrency;
                
                var currency =  free_shipping_message[0].match(/\d+/)[0];
                var new_currency = currency * shopperCurrency.exchangeRate;
                new_currency = formatMoney(new_currency, shopperCurrency.decimalPlaces, shopperCurrency.decimalSeparator, shopperCurrency.thousandsSeparator );
                if( shopperCurrency.symbolLocation == "left")
                    new_currency = shopperCurrency.symbol + new_currency;
                else
                    new_currency = new_currency + shopperCurrency.symbol;
                
                shipping_message = free_shipping_message[0] = free_shipping_message[0].replace(response.storeConfig.currency.symbol + currency, new_currency);
            }
        }
    });

    function formatMoney(n, c, d, t) {
      var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;

      return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    if( countryCode == '')
        findCountry();
    else
        getCart();
    
    $(document).ready(function(){

        var free_shipping_css = '@keyframes load-ani {100% {-webkit-transform: rotate(360deg);transform: rotate(360deg); } }@-webkit-keyframes load-ani {100% {-webkit-transform: rotate(360deg); } }@keyframes fadeIn {from {opacity: 0; }to {opacity: 1; } }@-webkit-keyframes fadeIn {from {opacity: 0; }to {opacity: 1; } }@-webkit-keyframes progress-bar-stripes { from { background-position: 0 0 }to { background-position: 40px 0 }}@-moz-keyframes progress-bar-stripes { from { background-position: 0 0 }to { background-position: 40px 0 }}@keyframes progress-bar-stripes { from { background-position: 0 0 }to { background-position: 40px 0 }}.page-type-cart [data-cart-status], .page-type-cart .alertBox.alertBox--info {display: none;}';
        $( "<style>"+free_shipping_css+"</style>" ).appendTo( "head" );

        shipping_message = "<span>"+shipping_message+"</span>";
               
        $(document).ajaxComplete(( event, xhr, settings ) => {

            try{
                if ( settings.url.indexOf("/cart.php") != -1 ) {
                    
                    if( xhr.responseJSON != undefined ) {
                        if( xhr.responseJSON.hasOwnProperty('statusMessages') ){
                            if( xhr.responseJSON.statusMessages != "" )
                                showFreeShippingMessage(xhr.responseJSON.statusMessages, previewCart);
                            else
                                showFreeShippingMessage(shipping_message, previewCart);
                            previewCart = '';
                            max_percent = 0;
                            is_exist_100 = false;
                        }
                    }
                    else{
                        if( $(xhr.responseText).hasClass('previewCart') ){
                            previewCart = 'popupCart';
                            getCart(  );
                        } 
                        else if( $(xhr.responseText).find('.previewCart').length ) {
                            previewCart = 'previewCart';
                            getCart(  );
                        }
                    }
                    
                }
            }
            catch(e){}
        });
    
        
    });

    function getCart(){
        utils.api.cart.getContent(options, (err, response) => { });
    }

    function showFreeShippingMessage(message, previewCart = '') {
        var country = "";
        if( $(message).length ) {
           

            $(message).each((i, el) => {
                if( el.nodeName == "#text")
                    return;
                if( is_exist_100 == true)
                    return;
                
                country = $('.country', $(el)).text();
                var countryList = country.split(",");

                if( $('.condition_remaining', $(el)).text() != "" || $('.congratulation', $(el)).text()){
                    if ($.inArray(countryCode, countryList) != -1) 
                        shipping_message = showProgress(message, el);
                    else if ($.inArray("All", countryList) != -1) 
                        shipping_message = showProgress(message, el);
                    else if( max_percent == 0)
                            shipping_message = free_shipping_message[0];
                }
            });
        }
        else {
            shipping_message = free_shipping_message[0];
        }
    }

    function showProgress(shipping_message, el) {
        const condition_required    = $('.condition_required', $(el)).text();
        const condition_matched     = $('.condition_matched', $(el)).text();
        const condition_remaining   = $('.condition_remaining', $(el)).text();

        const num_required  = (condition_required != "" ? Number(condition_required.replace(/[^0-9.-]+/g,"")) : 0);
        const num_matched   = (condition_matched != "" ? Number(condition_matched.replace(/[^0-9.-]+/g,"")) : 0);
        const num_remaining = (condition_remaining != "" ? Number(condition_remaining.replace(/[^0-9.-]+/g,"")) : 0);
        
        shipping_message = free_shipping_message[1].replace('{{remaining}}',condition_remaining );
        var percent = parseInt(num_matched / num_required * 100);
        percent = (percent > 100 ? 100 : percent);
        if( num_required == num_remaining )
            percent = 100;

        if( $('.congratulation', $(el)).text() != "")
            percent = 100;
        if(percent > max_percent)
            max_percent = percent;
        else
            return;

        var color = (themeSettings.themevale_free_shipping_99 ? themeSettings.themevale_free_shipping_99 : '#69c69c');
        if(percent <= 30 ) {
            color = (themeSettings.themevale_free_shipping_33 ? themeSettings.themevale_free_shipping_33 : '#f44336');
        }
        else if( percent <= 60) {
            color = (themeSettings.themevale_free_shipping_66 ? themeSettings.themevale_free_shipping_66 : '#ff9800');
        }
        else if( percent == 100 ){
            shipping_message = free_shipping_message[2];
        }

        var progress = '<div class="progress_shipping" role="progressbar" style="height: 15px; margin-bottom: 10px;background-color: #e1dfd6;-webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);box-shadow: inset 0 1px 2px rgba(0,0,0,.1);">\
                        <div class="progress-meter" style="position: relative;display: block;height: 100%;background-color: '+color+';text-align: center; line-height: 15px;color: #ffffff;width: '+percent+'%; -webkit-animation: 2s linear 0s normal none infinite running progress-bar-stripes;animation: 2s linear 0s normal none infinite running progress-bar-stripes;background-image: -webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,rgba(0,0,0,0) 25%,rgba(0,0,0,0) 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,rgba(0,0,0,0) 75%,rgba(0,0,0,0)); background-size: 40px 40px; transition: 0.9s linear; transition-property: width, background-color;">'+percent+'%</div>\
                    </div>';

        if( previewCart == 'popupCart'){
            if( $('.free_shipping_message', $('.previewCart')).length >= 1 ){
                $('.free_shipping_message', $('.previewCart')).remove();
            }
            if( $('.free_shipping_message', $('.previewCart')).length == 0 ){
                if (percent < 100 ){
                    progress += '<div class="shipping_message" style="margin-bottom: 25px; font-style: italic; color: '+ themeSettings.themevale_free_shipping_text +';">'+free_shipping_message[1].replace('{remaining}','<b style="font-weight: 700;">'+condition_remaining+'</b>' )+'</div>';
                    shipping_message = free_shipping_message[1].replace('{remaining}','<span style="border-bottom: 1px solid #fff; display: inline-block; line-height: 19px;">'+condition_remaining+'</span>' );
                }
                else{
                    is_exist_100 = true;
                    progress = '<div class="shipping_message_100" style="margin-bottom: 30px;background-color: '+ themeSettings.themevale_free_shipping_success_bg +';color: '+ themeSettings.themevale_free_shipping_success_text +';">'+free_shipping_message[2]+'</div>';
                }
                $('.previewCartList').before('<div class="free_shipping_message">' + progress + '</div>');
            }
        }
        else if( previewCart == 'previewCart' ){

            if( $('.free_shipping_message', $('.previewCart').parent() ).length >= 1 ){
                $('.free_shipping_message', $('.previewCart').parent() ).remove();
            }
            if( $('.free_shipping_message', $('.previewCart').parent() ).length == 0 ){
                if (percent < 100 ){
                    progress += '<div class="shipping_message" style="margin-bottom: 25px; font-style: italic; color: '+ themeSettings.themevale_free_shipping_text +';">'+free_shipping_message[1].replace('{remaining}','<b style="font-weight: 700;">'+condition_remaining+'</b>' )+'</div>';
                    shipping_message = free_shipping_message[1].replace('{remaining}','<span style="border-bottom: 1px solid #fff; display: inline-block; line-height: 19px;">'+condition_remaining+'</span>' );
                }
                else{
                    is_exist_100 = true;
                    progress = '<div class="shipping_message_100" style="margin-bottom: 30px; background-color: '+ themeSettings.themevale_free_shipping_success_bg +';color: '+ themeSettings.themevale_free_shipping_success_text +';">'+free_shipping_message[2]+'</div>';
                }
                $('.previewCart').parent().prepend('<div class="free_shipping_message">' + progress + '</div>');
            }
        }
        else if( window.location.pathname == '/cart.php'){
            // cart page
            if( $('.free_shipping_message', $('.cart-content').parent() ).length >= 1 ){
                $('.free_shipping_message', $('.cart-content').parent() ).remove();
            }
            if( $('.free_shipping_message', $('.cart-content').parent() ).length == 0 ){
                if (percent < 100 ){
                    progress += '<div class="shipping_message" style="margin-bottom: 30px; font-style: italic; color: '+ themeSettings.themevale_free_shipping_text +';">'+free_shipping_message[1].replace('{remaining}','<b style="font-weight: 700;">'+condition_remaining+'</b>' )+'</div>';
                    shipping_message = free_shipping_message[1].replace('{remaining}','<span style="border-bottom: 1px solid #fff; display: inline-block; line-height: 19px;">'+condition_remaining+'</span>' );
                }
                else{
                    is_exist_100 = true;
                    progress = '<div class="shipping_message_100" style="margin-bottom: 35px;background-color: '+ themeSettings.themevale_free_shipping_success_bg +';color: '+ themeSettings.themevale_free_shipping_success_text +';">'+free_shipping_message[2]+'</div>';
                }
                $('.cart-content').prepend('<div class="free_shipping_message">' + progress + '</div>');
            }
        }
        else{
            // not cart page
            if (percent < 100 ){
                shipping_message = free_shipping_message[1].replace('{remaining}','<span style="border-bottom: 1px solid #fff; display: inline-block; line-height: 19px;">'+condition_remaining+'</span>' );
            }
            else{
                is_exist_100 = true;
                shipping_message = free_shipping_message[2];
            }
        }

        return shipping_message;
    }

    function findCountry () {
        $.getScript('https://ssl.geoplugin.net/javascript.gp?k=9247556ec91c71e9', function() {
            countryName = geoplugin_countryName();
            countryCode = geoplugin_countryCode();
            currencyCode = geoplugin_currencyCode();

            var countryCodeArray = ["US"];
            var destinationCountryName = "<span>Free shipping, within US, for orders over 3 Orbit Small</span>";

            if ($.inArray(countryCode, countryCodeArray) != -1) {
                shipping_message = destinationCountryName;
            }

            var countryCodeArray = ["HK","CN","TW","JP","TH","PH","ID","VN","BN","KR","PK","IN","BD","MM","NP","KP","LK","KZ","KH","LA","UZ","MN","MO","TL","IR","IQ","YE","AF","SY","AZ","AE","TJ","KG","LB","OM","KW","QA","BH","BT"];
            var destinationCountryName = "<span>Free shipping, within Vietnam, for orders over $200</span>";

            if ($.inArray(countryCode, countryCodeArray) != -1) {
                // alert(destinationCountryName+"-"+destinationCountryURL);
                shipping_message = destinationCountryName;
            }

            getCart(  );

        });
    }

    function setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
   }

   function getCookie(cname) {
      const name = cname + '=';
      const ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) === ' ') {
            c = c.substring(1);
         }
         if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
         }
      }
      return '';
   }

   const deleteCookie = function(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   };
}
