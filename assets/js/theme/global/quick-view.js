import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from './modal';
import 'slick-carousel';

export default function (context) {
    const modal = defaultModal();

    $('body').on('click', '.quickview', event => {
        event.preventDefault();

        const productId = $(event.currentTarget).data('productId');
        $('.card').find('.quickShopWrap').remove();
        $('.card').find('.card-figure').removeClass('has-popup');

        modal.open({ size: 'large' });
        $('#modal').addClass('modal-quickview');

        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
            modal.updateContent(response);

            modal.$content.find('.productView').addClass('productView--quickView');

            modal.$content.find('[data-slick]').slick();

            initCountdown2();
            
            var heightImg = modal.$content.find('.productView .productView-nav .productView-image').height();
            modal.$content.find('.productView-details-inner').css('max-height',heightImg);
            
            var productDetails = new ProductDetails(modal.$content.find('.quickView'), $('.quickView .productView .productView-details-options'), context);
            productDetails.setProductVariant();

            return productDetails;
        });

    });


    function initCountdown2() {
        if ($('.countDowntimer2').length) {
            // Set the date we're counting down to        
            var countDownDate = new Date( $('.countDowntimer2').attr('data-count-down2')).getTime();
            // Update the count down every 1 second
            var countdownfunction = setInterval(function() {

                // Get todays date and time
                var now = new Date().getTime();
        
                // Find the distance between now an the count down date
                var distance = countDownDate - now;
        
                // If the count down is over, write some text 
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    $(".countDowntimer2").html('');
                } else {
                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
                    // Output the result in an element with class="countDowntimer"
                    var strCountDown = "<div class='clock-item'><span class='num'>"+ days + "D</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>"+ hours + "H</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + minutes + "M</span><span class='text'>:</span></div><div class='clock-item'><span class='num'>" + seconds + "S</span></div>";
                    $(".countDowntimer2").html(strCountDown);
                }
            }, 1000);
        }
   }
   
}
