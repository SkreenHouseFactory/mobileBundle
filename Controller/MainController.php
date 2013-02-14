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
    public function tvAction(Request $request)
    {

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      /*$result = $api->fetch('schedule/tvreplay', array(
                   'date' => 'Ce soir',
                   'sort' => 'channels',
                   'with_best_offer' => true,
                   'tnt_only' => true
                ));*/
      $result = $api->fetch('schedule/epg', array(
                   'timestamp' => strtotime(date('Y-m-d 20:00:00'))
                ));
      //echo $api->url;
      return $this->render('SkreenHouseFactoryMobileBundle:Main:tv.html.twig', array(
                'channels' => (array)$result->channels
             ));
    }

    /**
    *
    */
    public function cinemaAction(Request $request)
    {
      $result = null;
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      if ($request->get('q')) {
        $result = $api->fetch('schedule/cine', array(
                      'q' => $request->get('q')
                    ));
      } elseif ($request->get('latlng')) {
        list ($lat, $lng) = explode(',', $request->get('latlng'));
        $result = $api->fetch('schedule/cine', array(
                      'fromGeoloc' => true,
                      'lat' => $lat,
                      'long' => $lng
                    ));
      }
      //echo $api->url;
      return $this->render('SkreenHouseFactoryMobileBundle:Main:cinema.html.twig', array(
                'cinemas' => $result ? (array)$result[0]->theaters : null,
                'programs' => $result ? $result[1]->programs : null,
             ));
    }
    
    /**
    *
    */
    public function cinemaprogramAction(Request $request)
    {

      $cinemas = null;
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      if ($request->get('q') || $request->get('cinema_id')) {
        $cinemas = $api->fetch('schedule/cine', array(
                      'program_id' => $request->get('id'),
                      'theater_ids' => $request->get('cinema_id'),
                      'with_schedule' => true,
                      'q' => $request->get('q')
                    ));
      } elseif ($request->get('latlng')) {
        list ($lat, $lng) = explode(',', $request->get('latlng'));
        $cinemas = $api->fetch('schedule/cine', array(
                      'program_id' => $request->get('id'),
                      'with_schedule' => true,
                      'fromGeoloc' => true,
                      'lat' => $lat,
                      'long' => $lng
                    ));
      }

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $program = $api->fetch('program/'.$request->get('id'), array(
                    'img_width' => 300,
                    'img_height' => 400
                  ));

      return $this->render('SkreenHouseFactoryMobileBundle:Main:cinemaprogram.html.twig', array(
                'program' => $program,
                'cinemas' => $cinemas,
                'days' => array('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')
             ));
    }

    /**
    *
    */
    public function notifsAction(Request $request)
    {
      $response = $this->render('SkreenHouseFactoryMobileBundle:Main:notifs.html.twig', array(
             ));
      $response->setPrivate();
      $response->setMaxAge(0);
      $response->headers->addCacheControlDirective('no-cache');
      $response->headers->addCacheControlDirective('must-revalidate');

      return $response;
    }

    /**
    *
    */
    public function selectionAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      if ($request->get('id')) {
        $result = $api->fetch('www/slider/pack/' . $request->get('id'), array(
                    'with_programs' => true
                  ));
        //echo $api->url;
        return $this->render('SkreenHouseFactoryMobileBundle:Main:selection.html.twig', array(
                 'pack' => $result
               ));
      } else {
        $result = $api->fetch('www/home/mixte', array(
                     'skip_programs' => true,
                     'disable_social' => true,
                     'strip_tags' => true
                  ));

        //echo $api->url;
        return $this->render('SkreenHouseFactoryMobileBundle:Main:selection.html.twig', array(
                 'home' => $result
               ));
      }
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
      $response = $this->render('SkreenHouseFactoryMobileBundle:Main:playlist.html.twig', array(
               'programs' => $result
             ));
      
      $response->setPrivate();
      $response->setMaxAge(0);
      $response->headers->addCacheControlDirective('no-cache');
      $response->headers->addCacheControlDirective('must-revalidate');

      return $response;
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
      $result = $api->fetch('search/'.urlencode(str_replace('.', '%2E', $request->get('q'))), array(
                   'offset' => 0,
                   'nb_results' => $request->get('onglet') ? 500 : 10,
                   'fromWebsite' => 'mobile',
                   'format' => $request->get('onglet')
                ));

      return $this->render('SkreenHouseFactoryMobileBundle:Main:search.html.twig', array(
               'result' => $result,
               'onglets' => array('films' => 'Films', 
                                  'documentaires' => 'Documentaires', 
                                  'emissions' => 'Emissions', 
                                  'series' => 'Séries', 
                                  //'archives' => 'Archives'
                                  ),
               'format' => $request->get('onglet')
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
    public function programAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $program = $api->fetch('program/'.$request->get('id'), 
                           array(
                             'img_width' => 300,
                             'img_height' => 400,
                             'with_offers' => true,
                             'with_icsfile' => true,
                             'with_teaser' => true,
                             'with_player' => true,
                             'with_metadata' => true,
                             'player' => 'hls',
                             'quality' => 'HQ'
                           ));
      //echo $api->url;
      //print_r($program->boutons);
      return $this->render('SkreenHouseFactoryMobileBundle:Main:program.html.twig', array(
               'program' => $program,
               'offers' => array(//'deportes' => 'Sur mySkreen', 
                                 'plays' => 'VOD & Replay', 
                                 'broadcasts' => 'A la télé', 
                                 'theaters' => 'Au cinéma')
             ));
    }
}