<!--div class="contPrd">
    <div>
        <div class="border-radial1 mr-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt1' ); ?>
        </div>
    </div>
    <div>
        <div class="border-radial1 ml-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt3' ); ?>
        </div>
    </div>
</div-->

<?php
if (is_front_page()):
?>
<div class="text-center text-uppercase py-2">
    <h3>News</h3>
</div>

<div class="mt-2 mb-2">
    <div class="owl-carousel">
        <?php

        $args = array(
            'category_name' => 'news, case-studies'
        );

        // the query
        $the_query = new WP_Query( $args );

        //echo $the_query->post_count;

        if($the_query->have_posts()):

        while ($the_query->have_posts()) : $the_query->the_post();

        ?>

        <div class="itmN">
            <h2><?php the_title(); ?></h2>
            <?php
            $content = get_the_content();
            the_post_thumbnail('medium_large', array( 'class' => 'img-fluid' ));
            //$trimmed_content = wp_trim_words($content, 15, '<br /><br /><a href="'. get_permalink() .'" class="btn-link text-uppercase">'.pll__('Leggi Tutto').'</a><br /><br />' );
            //echo $trimmed_content;
            //echo '<br /><br />';
            ?>
            <div class="mt-4 text-center" style="margin-top: auto;">
                <a href="<?php the_permalink(); ?>"><?php _e('Read more'); ?> ></a>
            </div>
        </div>

        <?php endwhile; ?>

        <?php wp_reset_postdata(); ?>

        <?php endif; ?>
    </div>
</div>
<?php endif; ?>

<div class="btm_footer p-3 mt-2">
    <div class="row">
        <div class="col-md-3">
            <?php dynamic_sidebar( 'btmQt1' ); ?>
        </div>
        <div class="col-md-3">
            <?php dynamic_sidebar( 'btmQt2' ); ?>
        </div>
        <div class="col-md-3">
            <?php dynamic_sidebar( 'btmQt3' ); ?>
        </div>
        <div class="col-md-3">
            <?php dynamic_sidebar( 'btmQt4' ); ?>
        </div>
    </div>
    <div class="row mt-4 pt-2 border-top">
        <div class="col-md-12 text-center">
            credits: <a href="https://www.2ld.it" target="_blank" rel="nofollow">2ld.it</a>
        </div>
		<div class="row mt-4 pt-2 border-top">
        <div class="col-md-12 text-center">
            Informazioni utili su <a href="https://www.2ld.it" target="_blank" rel="nofollow">2ld.it</a>
								  <a href="https://www.2ld.it" target="_blank" rel="nofollow">2ld.it</a>
								  <a href="https://www.2ld.it" target="_blank" rel="nofollow">2ld.it</a>								  
        </div>
    </div>
</div>

<!-- Optional JavaScript -->
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<!--script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script-->
<!--script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script-->
<!--script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>



<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/owl.carousel.min.js"></script-->
<!--script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/form.js"></script-->

<?php
  $slug = site_url().'/'.basename(get_permalink());
?>

<script type="text/javascript">

  var $crl = jQuery.noConflict();
  $crl(".owl-carousel").owlCarousel({
      responsive:{
          0: {
              items:1
          },
          768: {
              items:2
          },
          992: {
              items:3
          },
          1440: {
              items:4
          }
      },
      loop:true,
      /*margin:0,*/
      autoplay:true,
      autoplayTimeout:5000,
      autoplayHoverPause:true
  });

  var finWin = $crl(window).width();
  //alert(finWin);

  if(finWin > 991) {
      $crl('.navbar-collapse .dropdown-toggle').removeAttr('data-toggle');
  }

</script>

<script>
    jQuery( document ).ready( function() {
        //Setup our on formSumbit Listener.
        jQuery( document ).on( 'nfFormSubmitResponse', function() {
            //Do Stuff
            //ga('send', 'event', 'Email List', 'Subscribed', 'New Subscriber');
            gtag_report_conversion('<?php echo $slug; ?>');
            //console.log('ciao');
         });
    });
</script>

<?php wp_footer(); ?>
</body>
</html>
