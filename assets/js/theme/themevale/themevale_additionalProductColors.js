import ImageGallery from '../product/image-gallery';

export default function($scope, context, $productOptionsElement){
    var product_left = '.productView-images';
    var product_right = '.productView-details-wrap';
	
    $('document').ready(function(){
        initProductMoreview($(product_left, $scope));

        $productOptionsElement.on('change', event => {
            const $changedOption = $(event.target);

            // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
            if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
                return;
            }

            initProductMoreview($(product_left, $scope), $changedOption );
        });
    });

    function initProductMoreview (productMoreview, $elementChange = false) {
        var sliderFor = productMoreview.find('.productView-nav'),
            sliderNav = productMoreview.find('.productView-thumbnails'),
            vertical = sliderNav.data('vertical');

        if(context.themeSettings.themevale_variant_grouped === true) {
            // CUSTOM CODE FABIO: combining all the config fields themevale_variant_name - 7 in one array to check the filtering
            var obj, myarray = (context.themeSettings.themevale_variant_name + ',' + context.themeSettings.themevale_variant_name_1 + ',' + context.themeSettings.themevale_variant_name_2 + ',' + context.themeSettings.themevale_variant_name_3 + ',' + context.themeSettings.themevale_variant_name_4 + ',' + context.themeSettings.themevale_variant_name_5 + ',' + context.themeSettings.themevale_variant_name_6 + ',' + context.themeSettings.themevale_variant_name_7).split(',');
            // END CUSTOM CODE
            var label = productMoreview.siblings(product_right).find('[data-product-option-change]').find('label.form-label--inlineSmall');
            var className = '', classN = '.filter-';
			
            label.each(function(i, el){
				var re = $(el).find('small').text();
                var optionVal = $(el).find('[data-option-value]').text();
                var str = $(el).text().replace(re, '').replace(':', '').replace(optionVal, '').trim();
                if(jQuery.inArray( str, myarray) !== -1) {
                    
                    obj = $(el).parent('[data-product-attribute]');
                    
                    if( obj != undefined ){
                        if( obj.data('product-attribute') == "set-select" ) {
                            var inputChecked = obj.find('select option:selected');
                        }
                        else {
                            var inputChecked = obj.find(':radio:checked');
                        }
                        
                        if( inputChecked != undefined  && inputChecked.length) {
                            var clsName = inputChecked.data('filter');
                            clsName = clsName.replace('.filter-','');

                            classN += clsName;
                        }
                    }

                }
            });

            if( obj != undefined ){
                
                /* Start filter */
                sliderNav.slick('slickUnfilter');
                sliderFor.slick('slickUnfilter');

                if(classN !== '.filter-') {
                    className = classN;

                    if( sliderNav.find(className).length == 0 || sliderFor.find(className).length == 0) {
                        
                        for (var i = 0; i < myarray.length; i++) {
                            
                            label.each(function(i, el){
                                var re = $(el).find('small').text();
                                var optionVal = $(el).find('[data-option-value]').text();

                                var str = $(el).text().replace(re, '').replace(':', '').replace(optionVal, '').trim();
                                if( str == myarray[i]){
                                    
                                    obj = $(el).parent('[data-product-attribute]');
                                    if( obj != undefined ){
                                        if( obj.data('product-attribute') == "set-select" ) {
                                            var inputChecked = obj.find('select option:selected');
                                        }
                                        else {
                                            var inputChecked = obj.find(':radio:checked');
                                        }
                                        
                                        if( inputChecked != undefined  && inputChecked.length) {
                                            var clsName = inputChecked.data('filter');
                                            clsName = clsName.replace('.filter-','');

                                            if(sliderNav.find('.filter-' + clsName).length > 0)
                                                className = '.filter-' + clsName;

											if(sliderFor.find('.filter-' + clsName).length > 0)
                                                className = '.filter-' + clsName;
                                        }
                                    }
                                }
                            });
                        }
                    }

                    if(sliderNav.find(className).length) {
                        sliderNav.slick('slickFilter', className);
                    }
					
					if(sliderFor.find(className).length) {
						sliderFor.slick('slickFilter', className);
					}
                }

                if( sliderNav.find('.slick-current').length ) {
                    sliderNav.slick('slickGoTo', 0);
                }

                if( sliderFor.find('.slick-current').length ) {
                    sliderFor.slick('slickGoTo', 0);
                }

                sliderNav.on('click', 'a', function(e){
                    const $target = $(e.currentTarget);
                    var slideno = sliderNav.find('.slick-slide').index( $target.parents('.slick-active') );
                    sliderNav.slick('slickGoTo', slideno);
                    $target.parents('.slick-active').addClass('slick-current');
                    return false;
                });
                
                if( sliderNav.hasClass('slick-vertical') && maxHeight ){
                    sliderNav.find('.slick-list').css('height', maxHeight);
                }
                /* End filter */
                
            }
        }
    }
}