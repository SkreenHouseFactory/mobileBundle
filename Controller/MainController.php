<?php

/*
 * This file is part of the SkreenHouseFactoryMobileBundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\mobileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;

class MainController extends Controller
{
    /**
    *
    */
    public function homeAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryMobileBundle:Main:home.html.twig', array(
             ));
    }

    /**
    *
    */
    public function notifsAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryMobileBundle:Main:notifs.html.twig', array(
             ));
    }

    /**
    *
    */
    public function playlistAction(Request $request)
    {
      
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $result = $api->fetch('www/slider/queue/' . $request->get('session_uid') . '/access/' . $request->get('access'), array(
                   'programs_only' => 1,
                   'with_best_offer' => 1,
                   'img_width' => 50,
                   'img_height' => 50,
                   'nb_results' => 200
                ));
      //echo $api->url;
      return $this->render('SkreenHouseFactoryMobileBundle:Main:playlist.html.twig', array(
               'programs' => $result
             ));
    }

    /**
    *
    */
    public function dialogAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryMobileBundle:Main:dialog.html.twig', array(
             ));
    }

    /**
    *
    */
    public function searchAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $result = $api->fetch('search/'.urlencode($request->get('q')), array(
                   'offset' => 0,
                   'nb_results' => 10
                ));

      return $this->render('SkreenHouseFactoryMobileBundle:Main:search.html.twig', array(
               'result' => $result,
               'onglets' => array('films' => 'Films', 
                                  'documentaires' => 'Documentaires', 
                                  'emissions' => 'Emissions', 
                                  'series' => 'Séries', 
                                  'archives' => 'Archives')
             ));
    }

    /**
    *
    */
    public function signinAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryMobileBundle:Main:signin.html.twig', array(
              'url' => $request->get('url')
             ));
    }
    
    /**
    *
    */
    public function cinemaAction(Request $request)
    {

      $cinemas = null;
      if ($request->get('latlng')) {
        //$this->cinemas = Cinema::APIgetTheatersByIp($this->oProgramme->getId());
        list ($lat, $lng) = explode(',', $request->get('latlng'));

        $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
        $cinemas = $api->fetch('schedule/cine', array(
                      'program_id' => $request->get('id'),
                      'with_schedule' => true,
                      'fromGeoloc' => true,
                      'lat' => $lat,
                      'long' => $lng
                    ));
        //echo $api->url;
        //print_r($cinemas);
      }
      
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $program = $api->fetch('program/'.$request->get('id'), array(
                    'img_width' => 300,
                    'img_height' => 400
                  ));
      return $this->render('SkreenHouseFactoryMobileBundle:Main:cinema.html.twig', array(
                'program' => $program,
                'cinemas' => $cinemas,
                'latlng' => $request->get('latlng'),
                'days' => array('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')
             ));
    }
    
    /**
    *
    */
    public function programAction(Request $request)
    {

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $program = $api->fetch('program/'.$request->get('id'), 
                           array(
                             'img_width' => 300,
                             'img_height' => 400,
                             'with_offers' => true,
                             'with_teaser' => true,
                             'with_player' => true,
                             'player' => 'hls'
                           ));
      //echo $api->url;
      //print_r($program->boutons);
      return $this->render('SkreenHouseFactoryMobileBundle:Main:program.html.twig', array(
               'program' => $program,
               'offers' => array('deportes' => 'Sur mySkreen', 
                                 'plays' => 'VOD & Replay', 
                                 'recs' => 'A la télé', 
                                 'theaters' => 'Au cinéma')
             ));
    }
}