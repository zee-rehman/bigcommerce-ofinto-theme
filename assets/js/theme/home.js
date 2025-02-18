import PageManager from './page-manager';
import haloAddOptionForProduct from './themevale/themevale_AddOptionForProduct';

export default class Home extends PageManager {
    constructor(context) {
        super(context);
    }

    onReady() {
    	this.loadOptionForProductCard();
    }

    loadOptionForProductCard() {
    	const context = this.context;

        if($('.productCarousel').length > 0){
            $('.productCarousel').each((index, element) => {
                var $prodWrapId = $(element).attr('id');

                haloAddOptionForProduct(context, $prodWrapId);
            });
        }
    }
}
