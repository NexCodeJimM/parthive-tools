"use client"; // Ensure this is a client-side component

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface CompatibilityTableRow {
  make: string;
  model: string;
  year: string;
  ccm: string;
  submodels: string;
  streetname: string;
}

interface FormData {
  productTitle: string;
  productOverview: string;
  keyFeatures: string[];
  perfectFor: string[];
  compatibilityTable: string;
}

interface Product {
  productTitle: string;
  productOverview: string;
  keyFeatures: string[];
  perfectFor: string[];
  compatibilityTable: CompatibilityTableRow[];
}

export default function Home() {
  const { register, handleSubmit } = useForm<FormData>();
  const [product, setProduct] = useState<Product>({
    productTitle: "",
    productOverview: "",
    keyFeatures: [],
    perfectFor: [],
    compatibilityTable: [],
  });

  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // States to manage dynamic input boxes
  const [keyFeaturesList, setKeyFeaturesList] = useState<string[]>([""]);
  const [perfectForList, setPerfectForList] = useState<string[]>([""]);

  const onSubmit = (data: FormData) => {
    setLoading(true);

    // Format the data for key features and perfect for lists (from dynamic inputs)
    const keyFeatures = keyFeaturesList.filter(Boolean);
    const perfectFor = perfectForList.filter(Boolean);

    // Format the compatibility table data
    const compatibilityTable = data.compatibilityTable
      .split("\n")
      .map((row) => {
        const [make, model, year, ccm, submodels, streetname] = row.split(",");

        // Check if the year is a range (e.g., 2015-2020)
        const years = year.split("-").map(Number);
        if (years.length === 2 && years[0] <= years[1]) {
          const rangeYears = [];
          for (let i = years[0]; i <= years[1]; i++) {
            rangeYears.push(i.toString());
          }
          return rangeYears.map((singleYear) => ({
            make,
            model,
            year: singleYear,
            ccm,
            submodels,
            streetname,
          }));
        } else {
          // If no year range, return a single entry
          return [{ make, model, year, ccm, submodels, streetname }];
        }
      });

    // Flatten the array if it's an array of arrays (in case of year range)
    const flattenedTable = compatibilityTable.flat();

    setProduct({
      productTitle: data.productTitle,
      productOverview: data.productOverview,
      keyFeatures,
      perfectFor,
      compatibilityTable: flattenedTable,
    });

    setLoading(false);
    setShowDialog(true); // Show dialog after form submission
  };

  // Handle Add and Delete functionality for key features
  const addKeyFeature = () => {
    setKeyFeaturesList([...keyFeaturesList, ""]);
  };

  const deleteKeyFeature = (index: number) => {
    const updatedKeyFeatures = [...keyFeaturesList];
    updatedKeyFeatures.splice(index, 1);
    setKeyFeaturesList(updatedKeyFeatures);
  };

  // Handle Add and Delete functionality for perfect for
  const addPerfectFor = () => {
    setPerfectForList([...perfectForList, ""]);
  };

  const deletePerfectFor = (index: number) => {
    const updatedPerfectFor = [...perfectForList];
    updatedPerfectFor.splice(index, 1);
    setPerfectForList(updatedPerfectFor);
  };

  // Function to generate the HTML snippet
  const generateHTMLSnippet = () => {
    const template = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${product.productTitle}</title>
<meta name="description" content="${product.productTitle}">
<meta name="keywords" content="${product.productTitle}">
<link rel="stylesheet" href="https://dezignbrain.com/ebay/part_hive/listing/css/bootstrap.min.css">
<link rel="stylesheet" href="https://dezignbrain.com/ebay/part_hive/listing/css/listing.css">
<link rel="stylesheet" href="https://wgnpspquzheta2n4.public.blob.vercel-storage.com/part-hive/ebay/bootstrap/custom-parthive-new5.css">
<link href="https://fonts.cdnfonts.com/css/gobold" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">


<!-- ------------ HEADER START ------------ -->
<div class="main_dezign_brain_header">
<div class="promo_top_text">
<div class="container">
<div class="dezign_top_menu">
<div class="row align-items-center">
<div class="col-lg-6">
<div class="welcom_text"><i class="fa-solid fa-house-chimney"></i> Welcome to <span>Part Hive</span>
</div>
</div>
<div class="col-lg-6">
<div class="top_newsletter_link">
<ul>
<li><a href="https://www.ebay.com/sch/i.html?_ssn=part-hive&amp;_sop=10" target="_blank"><i class="fa-solid fa-gift"></i> New Arrivals</a></li>
<li><a href="https://www.ebay.com/sch/i.html?_ssn=part-hive&amp;_sop=1" target="_blank"><i class="fa-solid fa-fire"></i> Ending Soon</a></li>
</ul>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="top_section">
<div class="container">
<div class="row align-items-center">
<div class="col-lg-4 col-md-6">
<div class="Verifie-main1">
<div class="Verifie-icon">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/top_header1.png" alt="">
</div>
<div class="Verifie-text1">
<h1>eBay-Verified Seller</h1>
<p>100% Authenticity Guaranteed</p>
</div>
</div>
</div>
<div class="col-lg-4">
<div class="top_header">
<div class="logo">
<a target="_blank" href="https://www.ebay.co.uk/str/parthive"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/logo.png" alt=""></a>
</div>
</div>
<div class="mobile_menu amon-container open-text theme-1">
<input type="checkbox" id="open">
<label class="amon" for="open">
<div class="menu_icon_wrapper">
<div class="menu_icon bars">
<div class="line-one"></div>
<div class="line-two"></div>
<div class="line-three"></div>
</div>
</div>
<ul>
<li><a target="_blank" href="https://www.ebay.co.uk/str/parthive"><i class="fa-solid fa-house"></i> Store Home</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/sch/part-hive/m.html?_trksid=p3692"><i class="fa-solid fa-thumbs-up"></i> Items For Sale</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/fdbk/feedback_profile/part-hive?filter=feedback_page%3ARECEIVED_AS_SELLER%2Cperiod%3ATWELVE_MONTHS%2Coverall_rating%3APOSITIVE&amp;commentType=POSITIVE"><i class="fa-solid fa-star"></i> Feedback</a></li>
<li><a target="_blank" href="https://contact.ebay.co.uk/ws/eBayISAPI.dll?ReturnUserEmail&amp;requested=part-hive"><i class="fa-solid fa-headset"></i> Contact Us</a></li>
</ul>
</label>
</div>
</div>
<div class="col-lg-4 col-md-6">
<div class="Verifie-main1 box1">
<div class="Verifie-icon">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/top_header1.png" alt="">
</div>
<div class="Verifie-text1">
<h1>Top Quality Products</h1>
<p>All Our Items Are High Quality</p>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="top_section1">
<div class="container">
<div class="header_bottom">
<div class="main_menu">
<ul>
<li><a target="_blank" href="https://www.ebay.co.uk/str/parthive"><i class="fa-solid fa-house"></i> Store Home</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/sch/part-hive/m.html?_trksid=p3692"><i class="fa-solid fa-thumbs-up"></i> Items For Sale</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/fdbk/feedback_profile/part-hive?filter=feedback_page%3ARECEIVED_AS_SELLER%2Cperiod%3ATWELVE_MONTHS%2Coverall_rating%3APOSITIVE&amp;commentType=POSITIVE"><i class="fa-solid fa-star"></i> Feedback</a></li>
<li><a target="_blank" href="https://contact.ebay.co.uk/ws/eBayISAPI.dll?ReturnUserEmail&amp;requested=part-hive"><i class="fa-solid fa-headset"></i> Contact Us</a></li>
</ul>
</div>
</div>
</div>
</div>
</div>
<!-- ------------ HEADER END ------------ -->

<!-- ------------ PROMOTION START ------------ -->
<div class="Prmotion_wrepper">
<div class="container">
<div class="promo_wrapper">
<div class="promotion">
<div class="promotion_box">
<div class="promotion_icon">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/s1.png" alt="">
</div>
<div class="promotion_text">
<h2>Fast &amp; Secure Shipping</h2>
</div>
</div>
<div class="promotion_box">
<div class="promotion_icon">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/s2.png" alt="">
</div>
<div class="promotion_text">
<h2>30 Days Moneyback</h2>
</div>
</div>
<div class="promotion_box">
<div class="promotion_icon">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/s4.png" alt="">
</div>
<div class="promotion_text">
<h2>100% Satisfaction Guarantee</h2>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- ------------ PROMOTION END ------------ -->

<!-- PRODUCT_DES3 START -->
<div class="listing_section">
<div class="container">

<div class="product_title_wrapper">
<h1 class="product_title_main">
${product.productTitle}
</h1>
<div class="title_divider"></div>
</div>

</div>
</div>

<div class="product-text">
<div class="container">
<div class="desc_box">

<div class="desc-hedtitle">Product Description</div>

<div class="pro-and-about">
<div class="listing_listingarea-box" id="right_box">
<div class="desc-rd desc-text">

<div vocab="https://schema.org/" typeof="Product">
<h2 class="perfect_for_title">
Overview
</h2>
<div class="perfect_for_divider"></div>
<span property="description">
<p>${product.productOverview}</p>
</span>
</div>

</div>
</div>
</div>

</div>
</div>
</div>
<!-- PRODUCT_DES3 END -->

<!-- START KEY FEATURES -->
<div class="product-text">
<div class="container">
<div class="desc_box">

<div class="desc-hedtitle">Specifications</div>

<div class="pro-and-about">
<div class="listing_listingarea-box" id="right_box">
<div class="desc-rd desc-text">

<!-- KEY FEATURES BULLETS -->
<ul class="key_features_list">
${product.keyFeatures.map((feature) => `<li>${feature}</li>`).join("")}
</ul>

<!-- PERFECT FOR SECTION -->
<div class="perfect_for_wrapper">

<h2 class="perfect_for_title">
Perfect For
</h2>

<div class="perfect_for_divider"></div>

<ul class="perfect_for_list">
${product.perfectFor.map((item) => `<li>${item}</li>`).join("")}
</ul>

</div>

</div>
</div>
</div>

</div>
</div>
</div>
<!-- END KEY FEATURES -->

<!-- START COMPATIBILITY TABLE -->
<div class="product-text">
<div class="container">
<div class="desc_box">
<div class="desc-hedtitle">Compatibility Table</div>
<div class="pro-and-about">
<div class="listing_listingarea-box" id="right_box">
<div class="desc-rd desc-text">
<div vocab="https://schema.org/" typeof="Product">
<span property="description">

<table style="width:100%; border-collapse: collapse;">
<thead>
<tr>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Make</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Model</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Year</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">CCM</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Submodels</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">StreetName</th>
</tr>
</thead>

<tbody>
${product.compatibilityTable
  .map(
    (entry) => `<tr>
		<td style="border:1px solid #ddd; padding:8px;">${entry.make}</td>
		<td style="border:1px solid #ddd; padding:8px;">${entry.model}</td>
		<td style="border:1px solid #ddd; padding:8px;">${entry.year}</td>
		<td style="border:1px solid #ddd; padding:8px;">${entry.ccm}</td>
		<td style="border:1px solid #ddd; padding:8px;">${entry.submodels}</td>
		<td style="border:1px solid #ddd; padding:8px;">${entry.streetname}</td>
	  </tr>`,
  )
  .join("")}
</tbody>

</table>

</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- COMPATIBILITY TABLE END -->

<!-- OFFER START -->
<div class="offer_wrapper">
<div class="container">
<div class="offer_main_title">
<h6>What We Offer</h6>
</div>
<div class="offer_item">
<div class="offer_box">
<div class="offer_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/offer_1.png" alt="">
</div>
<div class="offer_title">
<h6>OEM &amp; Aftermarket brands</h6>
</div>
<div class="offer_content">
<p>Sourced from leading manufacturers</p>
</div>
</div>
<div class="offer_box">
<div class="offer_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/offer_2.png" alt="">
</div>
<div class="offer_title">
<h6>Expanding Product Range</h6>
</div>
<div class="offer_content">
<p>New stock added regularly.</p>
</div>
</div>
<div class="offer_box">
<div class="offer_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/offer_3.png" alt="">
</div>
<div class="offer_title">
<h6>Fast and Reliable Delivery</h6>
</div>
<div class="offer_content">
<p>Efficient shipping across the UK and beyond.</p>
</div>
</div>
<div class="offer_box">
<div class="offer_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/offer_4.png" alt="">
</div>
<div class="offer_title">
<h6>Customer Support</h6>
</div>
<div class="offer_content">
<p>Assistance available for any product inquiries.</p>
</div>
</div>
</div>
</div>
</div>
<!-- OFFER END -->

<!-- ------------ banner ------------ -->
<div id="dezign_home_banner">
<div id="topheader">
<div id="slidersection">
<div class="slider">
<ul>
<li><a href="https://www.ebay.co.uk/str/parthive" target="_blank"><img class="main_banner" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner.png"><img class="banner_res" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner_res.png" alt=""></a></li>
<li><a href="https://www.ebay.co.uk/str/parthive" target="_blank"><img class="main_banner" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner2.png"><img class="banner_res" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner_res2.png" alt=""></a></li>
<li><a href="https://www.ebay.co.uk/str/parthive" target="_blank"><img class="main_banner" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner3.png"><img class="banner_res" src="https://dezignbrain.com/ebay/part_hive/listing/images/banner_res3.png" alt=""></a></li>
</ul>
</div>
</div>
</div>
</div>
<!-- ------------ banner END ------------ -->

<!-- NOTICE START -->
<div class="notice_wrapper">
<div class="container">
<div class="notice_title">
<h6>Important Notice</h6>
</div>
<div class="notice_content">
<p><b>Part Hive</b> is an independent reseller of <b>high-quality motorcycle spare parts</b> and is not affiliated with or endorsed by any motorcycle manufacturer. We source our products from <b>trusted suppliers</b> to provide riders with reliable, factory-branded OEM parts at competitive prices. Any references to vehicle brands, models, or part numbers are provided solely for identification and <b>compatibility purposes.</b></p>
<p>We are committed to providing <b>quality products &amp; excellent service to riders</b> and mechanics across the UK and beyond.</p>
</div>
</div>
</div>
<!-- NOTICE END -->

<!-- ------------ category START ------------ -->
<div class="feature_section">
<div class="container">
<div class="feature_top">
<div class="feature-title">
<h2>FEATURED CATEGORIES</h2>
</div>
<div class="browse_all_btn view"><a class="button" href="https://www.ebay.co.uk/str/parthive" target="_blank">View All Categories <i class="fa-solid fa-chevron-right"></i></a></div>
</div>
</div>
<div class="container">
<div class="row align-items-center justify-content-center">
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Engine-Parts/_i.html?store_cat=44398947011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_01.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Engine-Parts/_i.html?store_cat=44398947011" target="_blank">
<h2>Engine Parts</h2>
</a>
</div>
</div>
</div>
</div>
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Bodywork/_i.html?store_cat=44398948011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_02.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Bodywork/_i.html?store_cat=44398948011" target="_blank">
<h2>Bodywork</h2>
</a>
</div>
</div>
</div>
</div>
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Lighting/_i.html?store_cat=44398949011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_03.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Lighting/_i.html?store_cat=44398949011" target="_blank">
<h2>Lighting</h2>
</a>
</div>
</div>
</div>
</div>
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Air-Oil-Filter/_i.html?store_cat=44398950011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_04.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Air-Oil-Filter/_i.html?store_cat=44398950011" target="_blank">
<h2>Air &amp; Oil Filter</h2>
</a>
</div>
</div>
</div>
</div>
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Suspension-Parts/_i.html?store_cat=44398951011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_05.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Suspension-Parts/_i.html?store_cat=44398951011" target="_blank">
<h2>Suspension Parts</h2>
</a>
</div>
</div>
</div>
</div>
<div class="col-lg-2 col-md-4 col-6">
<div class="cate_box">
<div class="feature_box"><a target="_blank" href="https://www.ebay.co.uk/str/parthive/Brake-Parts/_i.html?store_cat=44398952011"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/cate_06.png" alt=""></a></div>
<div class="fat_box">
<div class="fat_text">
<a href="https://www.ebay.co.uk/str/parthive/Brake-Parts/_i.html?store_cat=44398952011" target="_blank">
<h2>Brake Parts</h2>
</a>
</div>
</div>
</div>
</div>
</div>
<div class="browse_all_btn view2"><a class="button" href="https://www.ebay.co.uk/str/parthive" target="_blank">View All Categories <i class="fa-solid fa-chevron-right"></i></a></div>
</div>
</div>
<!-- ------------ category end ------------ -->

<!-- ABOUT1 START -->
<div class="about_wrapper">
<div class="container">
<div class="row align-items-center">
<div class="col-lg-6">
<div class="about_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/about-img.png" alt="">
</div>
</div>
<div class="col-lg-6">
<div class="about_content">
<h6>About Part Hive</h6>
<p>Part Hive is a family-run business with decades of expertise in motorbike parts and repairs. What started in 1999 as a small mobile repair service by the founder of Ben Scooter Ltd, has grown into a trusted name in the industry, supplying high-quality motorcycle and scooter parts worldwide.</p>
<p>At Part Hive, we are not just selling parts?we're fuelling a legacy. Whether you're a mechanic, a delivery driver, or a passionate rider, you are part of something bigger. A hive of innovation, reliability, and exceptional service. Backed by years of hands-on experience, we ensure every product meets the highest standards.From humble beginnings to a thriving platform, the journey continues.Welcome to the Hive.</p>
<div class="browse_all_btn about"><a class="button" href="https://www.ebay.co.uk/str/parthive" target="_blank">Visit Our Store <i class="fa-solid fa-chevron-right"></i></a></div>
</div>
</div>
</div>
</div>
</div>
<!-- ABOUT1 END -->

<!-- ------------ MAIN TAB START ------------ -->
<div class="tabsbottom">
<div class="container">
<div class="clear"></div>
<input id="table1" name="tables" type="radio"><label for="table1"><div class="message_desk"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/shipping.png" alt=""></div><div class="message_res"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/shipping_res.png" alt=""></div>Shipping</label><input id="table2" name="tables" checked="checked" type="radio"><label for="table2"><div class="message_desk"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/return.png" alt=""></div><div class="message_res"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/return_res.png" alt=""></div>Returns</label><input id="table3" name="tables" type="radio"><label for="table3"><div class="message_desk"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/payment.png" alt=""></div><div class="message_res"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/payment_res.png" alt=""></div>Payment</label><input id="table4" name="tables" type="radio"><label for="table4"><div class="message_desk"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/support.png" alt=""></div><div class="message_res"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/support_res.png" alt=""></div>Customer Support</label><input id="table5" name="tables" type="radio"><label for="table5"><div class="message_desk"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/quality.png" alt=""></div><div class="message_res"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/quality_res.png" alt=""></div>Quality Control Policy</label>
<section id="content1">
<p>Orders placed before 12pm are dispatched the same day; later orders go out the next working day.</p>
<p>In case of stock shortages, we will notify you and refund your order within one working day.</p>
<p>Tracking updates are provided via email or eBay if contact details are supplied.</p>
<p>Tracking updates are provided via email or eBay if contact details are supplied.</p>
<p>Delivery Areas: We deliver to the UK, Republic of Ireland, Isle of Man, Jersey, Channel Islands, and most of Europe - if in doubt please do contact us before placing your order.</p>
</section>
<section id="content2">
<p>At Part Hive we provide a 30 day warranty on faulty products, applicable from the date of delivery. </p>
<p>Faulty items can be exchanged or refunded upon return, subject to stock availability. </p>
<p>To qualify for a refund, items must: </p>
<p>Be proven faulty </p>
<p>Be in original packaging with all accessories</p>
</section>
<section id="content3">
<p>We accept PayPal, along with all major credit and debit cards for your convenience. If you need any assistance or further details regarding payment options, please feel free to message us. We're happy to provide any additional information you may need!</p>
</section>
<section id="content4">
<p>For any questions regarding compatibility, availability, or orders, please don't hesitate to contact us. We are more than happy to assist you with any inquiries. You can reach us easily through our website's contact form, or you can directly message us on WhatsApp for a quicker response. We're here to help and ensure your experience is seamless!</p>
</section>
<section id="content5">
<p>At Part Hive, we are committed to ensuring every item we dispatch meets our quality standards.</p>
<p>? All products are subject to a thorough quality control inspection before shipping.</p>
<p>? Sealed items may be opened to check for any damage or discrepancies prior to dispatch.</p>
<p>? This process helps us ensure that each customer receives the correct item in excellent condition.</p>
<p>We carry out these checks to maintain high service standards and provide peace of mind to our customers.</p>
</section>
</div>
</div>
<!-- ------------ MAIN TAB END ------------ -->

<!-- ------------ feedback END ------------ -->
<div class="guaranteed_wapper">
<div class="container">
<div class="guaranteed-head">
<h5>Why customers love us?</h5>
</div>
<div class="row justify-content-center">
<div class="col-lg-3 col-md-6">
<div class="guaranteed_item">
<div class="guaranteed_box">
<div class="coma"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/coma.png" alt=""></div>
<div class="guaranteed_text">"Highly recommended! Reliable seller and top-notch parts."</div>
<div class="start"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/star.png" alt=""></div>
<div class="guaranteed_name">Buyer: U***H (426)</div>
</div>
</div>
</div>
<div class="col-lg-3 col-md-6">
<div class="guaranteed_item">
<div class="guaranteed_box">
<div class="coma"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/coma.png" alt=""></div>
<div class="guaranteed_text">"Fast delivery, great communication, and perfect condition."</div>
<div class="start"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/star.png" alt=""></div>
<div class="guaranteed_name">Buyer: .***Z (2761)</div>
</div>
</div>
</div>
<div class="col-lg-3 col-md-6">
<div class="guaranteed_item">
<div class="guaranteed_box">
<div class="coma"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/coma.png" alt=""></div>
<div class="guaranteed_text">"Installed smoothly, car performance improved instantly!"</div>
<div class="start"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/star.png" alt=""></div>
<div class="guaranteed_name">Buyer: E***T (3068)</div>
</div>
</div>
</div>
<div class="col-lg-3 col-md-6">
<div class="guaranteed_item">
<div class="guaranteed_box">
<div class="coma"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/coma.png" alt=""></div>
<div class="guaranteed_text">"Top-notch customer service and high-quality parts!"</div>
<div class="start"><img src="https://dezignbrain.com/ebay/part_hive/listing/images/star.png" alt=""></div>
<div class="guaranteed_name">Buyer: M***D (1748)</div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- ------------ feedback END ------------ -->

<!-- ------------ footer ------------ -->
<footer>
<div class="store_footer_wapper">
<div class="container">
<div class="row align-items-center">
<div class="col-lg-4">
<div class="footer_logo"><a href="https://www.ebay.co.uk/str/parthive" target="_blank"> <img src="https://dezignbrain.com/ebay/part_hive/listing/images/footer_logo.png" alt=""></a> </div>
</div>
<div class="col-lg-2">
<div class="footer_block footer_block02">
<div class="footer_menu">
<ul>
<li><a target="_blank" href="https://www.ebay.co.uk/str/parthive"><i class="fa-solid fa-house"></i> Store Home</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/sch/part-hive/m.html?_trksid=p3692"><i class="fa-solid fa-thumbs-up"></i> Items For Sale</a></li>
<li><a target="_blank" href="https://www.ebay.co.uk/fdbk/feedback_profile/part-hive?filter=feedback_page%3ARECEIVED_AS_SELLER%2Cperiod%3ATWELVE_MONTHS%2Coverall_rating%3APOSITIVE&amp;commentType=POSITIVE"><i class="fa-solid fa-star"></i> Feedback</a></li>
<li><a target="_blank" href="https://contact.ebay.co.uk/ws/eBayISAPI.dll?ReturnUserEmail&amp;requested=part-hive"><i class="fa-solid fa-headset"></i> Contact Us</a></li>
</ul>
</div>
</div>
</div>
<div class="col-lg-3">
<div class="footer_block footer_block03">
<div class="footer_block_titel">Payment Options</div>
<div class="payment_img">
<img src="https://dezignbrain.com/ebay/part_hive/listing/images/footer_payment.png" class="img-fluid">
</div>
</div>
</div>
<div class="col-lg-3">
<div class="footer_block footer_block04">
<div class="footer_block_titel">Shop With Confidence</div>
<div class="shop_img"> <img src="https://dezignbrain.com/ebay/part_hive/listing/images/footer_confidence.png" class="img-fluid"> </div>
</div>
</div>
</div>
</div>
</div>
<div class="footer_bottom">
<div class="container">
<div class="row align-items-center">
<div class="col-lg-7">
<div class="dezign_copyright"><i class="fa-regular fa-copyright"></i> Copyright 2025,<span> Part Hive. </span> All rights reserved.</div>
</div>
<div class="col-lg-5">
<div class="dezign_by">Made with <i class="fa-solid fa-heart" style="color: #fff;"></i> by<span> eBayshopdesign.org</span></div>
</div>
</div>
</div>
</div>
</footer>
<!-- ------------ footer END ------------ -->
    `;
    return template;
  };

  const copyToClipboard = () => {
    const snippet = generateHTMLSnippet();
    navigator.clipboard.writeText(snippet).then(() => {
      // Instead of the default alert(), we now use Sonner's toast for notification
      toast.success("HTML Snippet copied to clipboard!");
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-8">
        eBay Description Generator
      </h1>
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Field className="flex flex-col mb-1">
                <FieldLabel htmlFor="productTitle">Product Title:</FieldLabel>
                <Input
                  id="productTitle"
                  type="text"
                  {...register("productTitle")}
                  required
                />
              </Field>

              <Field className="flex flex-col mb-1">
                <FieldLabel htmlFor="productOverview">
                  Product Overview:
                </FieldLabel>
                <Textarea
                  id="productOverview"
                  {...register("productOverview")}
                  required
                />
              </Field>

              {/* Key Features - Dynamic Input Boxes */}
              <Field className="flex flex-col mb-1">
                <FieldLabel htmlFor="keyFeatures">Key Features:</FieldLabel>
                {keyFeaturesList.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const updatedFeatures = [...keyFeaturesList];
                        updatedFeatures[index] = e.target.value;
                        setKeyFeaturesList(updatedFeatures);
                      }}
                    />
                    {keyFeaturesList.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => deleteKeyFeature(index)}
                        variant="destructive"
                        className="cursor-pointer hover:bg-red-700"
                      >
                        x
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addKeyFeature}
                  className="bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white"
                  size="xs"
                >
                  + Add More
                </Button>
              </Field>

              {/* Perfect For - Dynamic Input Boxes */}
              <Field className="flex flex-col mb-1">
                <FieldLabel htmlFor="perfectFor">Perfect For:</FieldLabel>
                {perfectForList.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updatedItems = [...perfectForList];
                        updatedItems[index] = e.target.value;
                        setPerfectForList(updatedItems);
                      }}
                    />
                    {perfectForList.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => deletePerfectFor(index)}
                        className="cursor-pointer hover:bg-red-700"
                        variant="destructive"
                      >
                        x
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addPerfectFor}
                  className="bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white"
                  size="xs"
                >
                  + Add More
                </Button>
              </Field>

              {/* Compatibility Table */}
              <Field className="flex flex-col mb-5">
                <FieldLabel htmlFor="compatibilityTable">
                  Compatibility Table:
                </FieldLabel>
                <FieldDescription>
                  Enter compatibility table data as Make, Model, Year, CCM,
                  Submodels, Streetname
                </FieldDescription>
                <Textarea
                  id="compatibilityTable"
                  {...register("compatibilityTable")}
                  placeholder="Make, Model, Year, CCM, Submodels, Streetname"
                  required
                />
              </Field>

              <Button type="submit" className="hover:cursor-pointer">
                {loading ? "Generating..." : "Generate"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={showDialog}
        onOpenChange={(open) => setShowDialog(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generated HTML Snippet</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div className="overflow-auto p-4">
              <ScrollArea className="w-100 max-h-[60vh]">
                <pre className="whitespace-pre-wrap bg-gray-100 p-4">
                  {generateHTMLSnippet()}
                </pre>
              </ScrollArea>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={copyToClipboard}>
              Copy to Clipboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
