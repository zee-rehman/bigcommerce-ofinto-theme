import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import collapsibleFactory, { CollapsibleEvents } from './common/collapsible';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';
import objectFitImages from './global/object-fit-polyfill';

import themevaleGlobal from './themevale/themevaleGlobal';
import themevale_AddToCart from './themevale/themevale_AddToCart';
// import themevale_AddOption from './themevale/themevale_AddOptionForProduct';
import themevale_quickShop from './themevale/themevale_quickShop';
import AZBrands from './themevale/themevale_AZbrands';
import themevaleNewsletterPopup from './themevale/themevale_NewsletterPopup';
    window.themevaleNewsletterPopup = themevaleNewsletterPopup;
import RecentlyViewedProducts from './themevale/recently-viewed-products';
    window.RecentlyViewedProducts = RecentlyViewedProducts;
import BeforeYouLeave from './themevale/themevale_BeforeYouLeave';
    window.BeforeYouLeave = BeforeYouLeave;
import calculateFreeShipping from './themevale/CalculateFreeShipping';
    window.calculateFreeShipping = calculateFreeShipping;
    window.themeSettings = {};
import themevaleSticky from './themevale/themevale_stickyNavigation';
    window.themevaleSticky = themevaleSticky;
import themevaleMenu from './themevale/themevale_MegaMenu';
    window.themevaleMenu = themevaleMenu;
import './randomize-images/randomize-images';
        
export default class Global extends PageManager {
    onReady() {
        cartPreview(this.context.secureBaseUrl, this.context.cartId);
        quickSearch();
        currencySelector();
        foundation($(document));
        quickView(this.context);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        loadingProgressBar();
        svgInjector();
        objectFitImages();

        // if (this.context.themeSettings.themevale_color_variant == true) {
        //     themevale_AddOption();
        // }

        if (this.context.themeSettings.themevale_quick_shop == true) {
            themevale_quickShop(this.context);
        }
        
        themevaleGlobal(this.context);
        window.themeSettings = this.context.themeSettings;
        themevale_AddToCart();

        if ($('.page-type-brands').length) {
            if (this.context.themeSettings.themevale_brandlayout === 'aztable') {
                const azbrands = new AZBrands();
                azbrands.loaded(this.context.themeSettings.brandpage_brands_per_page);
            }
        }
    }
}
