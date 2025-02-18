import 'jquery-zoom';
import 'slick-carousel';

export default function ($scope, context, $productOptionsElement) {  
  // initialize jquery-zoom only above tablet
  const breakpointTablet = window.matchMedia('(min-width: 992px)');
  
  const breakpointCheckerForZoom = () => {
	if (breakpointTablet.matches) {
		setTimeout(() => {
			$('.js-slider-main-slides a:not([data-vbtype])').zoom({
				touch: false
			})
		}, 1);
	} else {
		setTimeout(() => {
			$('.js-slider-main-slides a:not([data-vbtype])').trigger('zoom.destroy');
		}, 1);
	}
  }

  breakpointCheckerForZoom();
  $(breakpointTablet).on('change', breakpointCheckerForZoom);
  
  // Add badge images
  const imgPath = context.themeSettings['product_badge_path'];

  $('.js-slider-main-slides [class*="-badge--"]').each(function(i, slide) {
    const badges = Array.from(slide.classList).filter(className => className.includes('badge'));
  
    badges.forEach(badge => {
      const parts = badge.split('--');
      let imageName = parts[1].trim(); // Extracts the filename part after "-badge--"
      const imagePosition = parts[2].trim().split('-')[0].trim(); // Extracts the position (e.g., "topleft")
      const isGlobal = badge.includes('-global'); // Checks if the class includes "-global"
  
      // Check if the filename already has an extension like .svg, .png, .jpg or .jpeg
      const hasExtension = /\.(svg|png|jpg|jpeg)$/i.test(imageName);
      const fileExtension = hasExtension ? '' : '.png'; // Append ".png" if no extension is provided
  
      const $container = isGlobal ? $(`.badge-${imagePosition}`) : $(slide).find(`.badge-${imagePosition}`);
      $container.append(`<img src="${imgPath + imageName + fileExtension}"/>`); // Add the image element to the container
    });
  });  

  // YouTube Video
  $('.js-slider-main-slides [class*="-v-yt-"]').each((i, item) => {
    const id = item.className.match(/-v-yt-([a-zA-Z0-9_-]+)/)[1];

    const link = item.querySelector('.js-product-gall');

    link.dataset.vbtype = 'video';
    link.dataset.autoplay = true;
    link.href = 'https://www.youtu.be/' + id;
  });

  // Vimeo Video
  $('.js-slider-main-slides [class*="-v-vm-"]').each((i, item) => {
    const id = item.className.match(/-v-vm-([a-zA-Z0-9_-]+)/)[1];

    const link = item.querySelector('.js-product-gall');

    link.dataset.vbtype = 'video';
    link.dataset.autoplay = true;
    link.href = 'https://vimeo.com/' + id;
  });


  // Add thumbs based on main slides
  $('.js-slider-thumbs-slides').html($('.js-slider-main-slides').html());

  // Initialize main slides
  $('.js-slider-main-slides').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
	waitForAnimate: false,
    arrows: true,
    fade: true,
    infinite: true,
	asNavFor: '.js-slider-thumbs-slides'
  })

  // Initialize thumbs
  $('.js-slider-thumbs-slides')
  .slick({
    slidesToShow: 7,
    swipeToSlide: true,
    draggable: true,
    swipe: true,
    touchThreshold: 100,
    focusOnSelect: true,
	waitForAnimate: true,
    arrows: false,
    infinite: false,
	asNavFor: '.js-slider-main-slides',
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5
        }
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 4
        }
      },
    ]
  })

  // Show the slider after DOM changes
  $('.js-slider').show();

  // Options and Filters
  const options = context.themeSettings['product_filters'].split(', ');
  //   console.log('all options, that should filter: ', options);

  // edit data-filter in options to match the -f- format
  $('[data-filter]').each((i, filter) => {
    const filterValue = filter.dataset.filter.replace(/\(.*\)/, '').toLowerCase().trim().replace(/\s+/g, '-');
    const filterName = $(filter).siblings('.form-label').first().text().toLowerCase().trim().replace(/:$/, '').split(/\s+/)[0];

    filter.dataset.filter = filterValue + '-' + filterName;
  });
  
  const filters = {};

  options.forEach(option => {
    const name = $(`.form-field.${option}`).find('input').first().attr('name');

    filters[name] = null;
  });
  
  for (const filter in filters) {
    const $radios = $(`.productView-options [name="${filter}"]`);
    const active = Array.from($radios).find(input => $(input).is(':checked'));

    if (active){
      filters[filter] = active.dataset.filter.toLowerCase();
    }
  
    $radios.on('change', function() {
      filters[filter] = this.dataset.filter.toLowerCase();
    //   console.clear();
    //   console.log('udpated filters', filters);    
      filterGallery(filters);
    })
  }

  filterGallery(filters);

  //console.log('initial filters:', filters);
  
  function filterGallery(filters) {
    $('.js-slider-main-slides').slick('slickUnfilter', '.visible');
    $('.js-slider-thumbs-slides').slick('slickUnfilter', '.visible');

    const elements = document.querySelectorAll('.slider__slide--filterable');

    elements.forEach(element => {
      if (element.classList.contains('-f-all')){
        element.classList.add('visible');
        return;
      }

      if (element.classList.contains('-no-gallery')) {
        element.classList.remove('visible');
        return;
      }

      let allClassesMatch = true;

      // Iterate over each filter condition
      for (let key in filters) {
        const filterClass = filters[key];

        // If the filter has a class (not an empty array), check if the element has it
        if (filterClass && !element.classList.contains(filterClass.replace('.', ''))) {
          allClassesMatch = false;
          break;
        }
      }

      // If the element has all classes from the filters, add the 'active' class
      if (allClassesMatch) {
        element.classList.add('visible');
      } else {
        element.classList.remove('visible');
      }
    });

    $('.js-slider-main-slides').slick('slickFilter', '.visible');
    $('.js-slider-thumbs-slides').slick('slickFilter', '.visible');

	// Init fancybox popup

	$('.js-slider-main-slides .js-product-gall').fancybox({
		baseClass: 'popup-product-gallery',
		beforeClose: function(instance, current) {
			$('.js-slider-main-slides').slick('slickGoTo', current.index);
			$('.js-slider-thumbs-slides').slick('slickGoTo', current.index);
		}
	});

    document.querySelectorAll('.js-slider-thumbs-slides .slider__slide').forEach((slide, index) => {
      slide.setAttribute('data-slick-index', index);
    });

    document.querySelectorAll('.js-slider-main-slides .slider__slide').forEach((slide, index) => {
      slide.setAttribute('data-slick-index', index);
    });

    $('.js-slider-main-slides').slick('slickGoTo', 0);
    $('.js-slider-thumbs-slides').slick('slickGoTo', 0);
  }
}