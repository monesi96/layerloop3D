<div class="contPrd">
    <div>
        <div class="border-radial1 mr-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt1' ); ?>
        </div>
    </div>
    <div>
        <div class="border-radial1 ml-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt2' ); ?>
            <div class="owl-carousel">
                <?php

                $args = array(
                    'category_name' => 'news'
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
                    <div class="mt-4 text-center">
                        <a href="<?php the_permalink(); ?>"><?php _e('Read more'); ?> ></a>
                    </div>
                </div>

                <?php endwhile; ?>

                <?php wp_reset_postdata(); ?>

                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="contPrd">
    <div>
        <div class="border-radial1 mr-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt3' ); ?>
        </div>
    </div>
    <div>
        <div class="border-radial1 ml-md-1 text-center mb-2">
            <?php dynamic_sidebar( 'btmQt4' ); ?>
        </div>
    </div>
</div>

<div class="btm_footer p-3 text-center">
    Smart Lab Industrie 3D srl - P.Iva 07732690727<br />
    Sede Legale Bari, Via Pietro Giannone 16/A<br />
    Iscritta nel registro delle start up innovative - Conosociata del Gruppo Finlogic SpA<br />
    Sedi Affiliate: Bari, Teramo, Molfetta, Reggio Calabria
</div>

<?php wp_footer(); ?>

<!-- Optional JavaScript -->
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

<script type="text/javascript">

    var $crl = jQuery.noConflict();
    var finWin = $crl(window).width();
    //alert(finWin);

    if(finWin > 991) {
        $crl('.navbar-collapse .dropdown-toggle').removeAttr('data-toggle');
    }


</script>


</body>
</html>
