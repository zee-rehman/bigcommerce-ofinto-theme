import utils from '@bigcommerce/stencil-utils';

export default function() {
    if ($(window).width() > 1024) {
        if ($('.productView-nextProducts').length) {
            var productId = $('.productView-nextProducts').data('product-id'),
                nextId = productId + 1,
                prevId = productId - 1,
                nextLink, prevLink;

            const $prodWrap = $('.productView-nextProducts .next-prev-modal'),
                $prodIcons = $('.productView-nextProducts .next-prev-icons'),
                $options = {
                    template: 'themevale/product/themevale-prev-next-product-tpm'
                };
            if(nextId == undefined && prevId == undefined) {
                $('.productView-title').removeClass('has-prev-next');
            }    

            if(nextId != undefined){
                utils.api.product.getById(nextId, $options, (err, response) => {
                    if(err){
                        return false;
                    }

                    nextLink = $(response).find('.card-link').attr('href');

                    if(nextLink != undefined){
                        $prodIcons.find('.next-icon').attr('href', nextLink);
                        $prodIcons.find('.next-icon').removeClass('disable');
                        $prodWrap.find('#next-product-modal').append(response);
                    } else{
                        $prodIcons.find('.next-icon').remove();
                        $prodWrap.find('#next-product-modal').remove();
                    }
                });            
            }

            if(prevId != undefined){
                utils.api.product.getById(prevId, $options, (err, response) => {
                    if(err){
                        return false;
                    }

                    prevLink = $(response).find('.card-link').attr('href');

                    if(prevLink != undefined){
                        $prodIcons.find('.prev-icon').attr('href', prevLink);
                        $prodIcons.find('.prev-icon').removeClass('disable');
                        $prodWrap.find('#prev-product-modal').append(response);
                    } else{
                        $prodIcons.find('.prev-icon').remove();
                        $prodWrap.find('#prev-product-modal').remove();
                    }
                });            
            }

            $prodIcons.on('mouseover', function(){
                $prodWrap.addClass('is-active');
            })
            .on('mouseleave', function(){
                $prodWrap.removeClass('is-active');
            });

            $('.next-icon', $prodIcons).on('mouseover', function(){
                $('#prev-product-modal').removeClass('is-show');
                $('#next-product-modal').addClass('is-show');
            });

            $('.prev-icon', $prodIcons).on('mouseover', function(){
                $('#next-product-modal').removeClass('is-show');
                $('#prev-product-modal').addClass('is-show');
            });

            $prodWrap.on('mouseover', function(){
                $prodWrap.addClass('is-active');
            })
            .on('mouseleave', function(){
                $prodWrap.removeClass('is-active');
            });
        }
    }
}
