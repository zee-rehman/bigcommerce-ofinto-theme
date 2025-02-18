import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
/* eslint-disable space-before-function-paren */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */

export default function() {

   const product_class = ".product";

   $('.view-as-btn .btn-select').on('click', function() {
      $('.btn-dropdown').toggleClass('is-open');
   })
   
   $(document).on('click', function(ev) {
      if ($(ev.target).closest('.view-as-btn').length === 0 && $(ev.target).closest('.view-as-btn .btn-select').length === 0) {
         $('.btn-dropdown').removeClass('is-open');
      }
   })

   // Product List
   $('#list-view').on('click', function() {
      if (!$(this).hasClass('current-view')) {
         // show loading
         setTimeout(function(){ 
            $('.list-view').addClass('current-view');
            $('.grid-view').removeClass('current-view');
            $('#product-listing-container .productListing').removeClass('productGrid').addClass('productList');
            $('.btn-dropdown').removeClass('is-open');
         }, 300);
      }
   });

   // Product Grid
   $('#grid-view').on('click', function() { 
      if (!$(this).hasClass('current-view')) {
         setTimeout(function(){ 
            $('.grid-view').addClass('current-view');
            $('.list-view').removeClass('current-view');
            $('#product-listing-container .productListing').removeClass('productList').addClass('productGrid');
            $('.btn-dropdown').removeClass('is-open');
         }, 300);
      }
   });
}
