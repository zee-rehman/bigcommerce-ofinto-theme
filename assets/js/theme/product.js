/*
 Import all product specific js
 */
 import PageManager from './page-manager';
 import Review from './product/reviews';
 import collapsibleFactory from './common/collapsible';
 import ProductDetails from './common/product-details';
 import videoGallery from './product/video-gallery';
 import { classifyForm } from './common/form-utils';
 import stickyAddToCart from './themevale/themevale_stickyAddToCart';
 import haloAddOptionForProduct from './themevale/themevale_AddOptionForProduct';
 
 export default class Product extends PageManager {
     constructor(context) {
         super(context);
         this.url = window.location.href;
         this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
         this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
     }
 
     onReady() {
         // Listen for foundation modal close events to sanitize URL after review.
         $(document).on('close.fndtn.reveal', () => {
             if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                 window.history.replaceState(null, document.title, window.location.pathname);
             }
         });
 
         let validator;
 
         // Init collapsible
         collapsibleFactory();
 
         this.productDetails = new ProductDetails($('.productView'), $('.productView .productView-details-options'), this.context, window.BCData.product_attributes);
         this.productDetails.setProductVariant();
         this.loadOptionForProductCard();
 
         videoGallery();
 
         const $reviewForm = classifyForm('.writeReview-form');
         const review = new Review($reviewForm);
 
         $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
             validator = review.registerValidation(this.context);
         });
 
         $reviewForm.on('submit', () => {
             if (validator) {
                 validator.performCheck();
                 return validator.areAll('valid');
             }
 
             return false;
         });
 
         this.productReviewHandler();
         this.bulkPricingHandler();
         
         stickyAddToCart();
 
         // Wrap-Erkennung hinzufügen
         this.checkWrap();
         this.initWrapObserver();
     }
 
     productReviewHandler() {
         if (this.url.indexOf('#write_review') !== -1) {
             this.$reviewLink.trigger('click');
         }
     }
 
     bulkPricingHandler() {
         if (this.url.indexOf('#bulk_pricing') !== -1) {
             this.$bulkPricingLink.trigger('click');
         }
     }
 
     loadOptionForProductCard() {
         if ($('.productCarousel').length > 0) {
             $('.productCarousel').each((index, element) => {
                 var $prodWrapId = $(element).attr('id');
                 haloAddOptionForProduct(this.context, $prodWrapId);
             });
         }
     }
 
     // Methode zur Überprüfung, ob die <dl>-Elemente umgebrochen wurden
     checkWrap() {
         requestAnimationFrame(() => {
             const dls = document.querySelectorAll(".productView-info dl");
 
             if (dls.length < 2) return; // Falls es kein zweites <dl> gibt, abbrechen
 
             const firstDL = dls[0];
             const secondDL = dls[1];
             const wrapper = document.querySelector(".productView-info");
 
             // Prüfen, ob das zweite <dl> umgebrochen wurde
             if (firstDL.getBoundingClientRect().top !== secondDL.getBoundingClientRect().top) {
                 secondDL.classList.add("wrapped");
                 firstDL.classList.add("wrapped-placeholder"); // Fügt den Platzhalter hinzu
                 wrapper.classList.add("wrapped-dls"); // Gibt beiden eine Klasse für min-width
             } else {
                 secondDL.classList.remove("wrapped");
                 firstDL.classList.remove("wrapped-placeholder"); // Entfernt den Platzhalter
                 wrapper.classList.remove("wrapped-dls"); // Entfernt die min-width-Klasse
             }
         });
     }
 
     // MutationObserver zur Beobachtung von DOM-Änderungen
     initWrapObserver() {
         const targetNode = document.querySelector(".productView-info");
 
         if (!targetNode) return;
 
         const observer = new MutationObserver(() => this.checkWrap());
         observer.observe(targetNode, { childList: true, subtree: true });
 
         // Event-Listener für Resize
         window.addEventListener("resize", () => this.checkWrap());
 
         // Initialen Check ausführen
         this.checkWrap();
     }
 }
 