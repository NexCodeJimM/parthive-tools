"use client"; // Ensure this is a client-side component

import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { CircleCheckIcon, Plus, Trash2 } from "lucide-react";
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
  compatibilityTable?: string;
}

interface Product {
  productTitle: string;
  productOverview: string;
  keyFeatures: string[];
  perfectFor: string[];
  compatibilityTable: CompatibilityTableRow[];
}

export default function Home() {
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const [product, setProduct] = useState<Product>({
    productTitle: "",
    productOverview: "",
    keyFeatures: [],
    perfectFor: [],
    compatibilityTable: [],
  });

  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showCompatibilityTableForm, setShowCompatibilityTableForm] =
    useState(false);

  // States to manage dynamic input boxes
  const [keyFeaturesList, setKeyFeaturesList] = useState<string[]>([""]);
  const [perfectForList, setPerfectForList] = useState<string[]>([""]);

  const onSubmit = (data: FormData) => {
    setLoading(true);

    // Format the data for key features and perfect for lists (from dynamic inputs)
    const keyFeatures = keyFeaturesList.filter(Boolean);
    const perfectFor = perfectForList.filter(Boolean);

    // Format the compatibility table data
    const compatibilityRows = (data.compatibilityTable ?? "")
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    const compatibilityTable = compatibilityRows.flatMap((row) => {
      const [make, model, year, ccm, submodels, streetname] = row
        .split(",")
        .map((value) => value?.trim() ?? "");

      // Ignore malformed rows when optional table is enabled but left partial.
      if (!make && !model && !year && !ccm && !submodels && !streetname) {
        return [];
      }

      // Check if the year is a range (e.g., 2015-2020)
      const years = year.split("-").map(Number);
      if (
        years.length === 2 &&
        Number.isFinite(years[0]) &&
        Number.isFinite(years[1]) &&
        years[0] <= years[1]
      ) {
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
      }

      // If no year range, return a single entry.
      return [{ make, model, year, ccm, submodels, streetname }];
    });

    setProduct({
      productTitle: data.productTitle,
      productOverview: data.productOverview,
      keyFeatures,
      perfectFor,
      compatibilityTable,
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

  const removeCompatibilityTable = () => {
    setValue("compatibilityTable", "");
    setShowCompatibilityTableForm(false);
    setProduct((prev) => ({ ...prev, compatibilityTable: [] }));
  };

  // Function to generate the HTML snippet
  const generateHTMLSnippet = () => {
    const compatibilityTableSection =
      product.compatibilityTable.length > 0
        ? `
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

<span style="color:#5A5A5A; font-size: 14px;">Please compare your existing part number and model details carefully before purchasing to ensure correct compatibility.</span>

<table style="width:100%; border-collapse: collapse; margin-top: 10px;">
<thead>
<tr>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Make</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Model</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Year</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">CCM</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Submodel</th>
<th style="border:1px solid #ddd; padding:8px; text-align:left;">Street Name</th>
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
<!-- COMPATIBILITY TABLE END -->`
        : "";

    const template = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${product.productTitle}</title>
<meta name="description" content="${product.productTitle}">
<meta name="keywords" content="${product.productTitle}">
<link rel="stylesheet" href="https://dezignbrain.com/ebay/part_hive/listing/css/bootstrap.min.css">
<link rel="stylesheet" href="https://dezignbrain.com/ebay/part_hive/listing/css/listing.css">
<link rel="stylesheet" href="https://wgnpspquzheta2n4.public.blob.vercel-storage.com/part-hive/ebay/bootstrap/custom-parthive-new6.css">
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
<h2 class="perfect_for_title">
Key Features
</h2>

<div class="perfect_for_divider"></div>

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

${compatibilityTableSection}

<!-- START DISCLAIMER -->
<div class="product-text">
<div class="container">
<div class="desc_box">
<div class="desc-hedtitle">Disclaimer</div>
<div class="pro-and-about">
<div class="listing_listingarea-box" id="right_box">
<div class="desc-rd desc-text">
<div vocab="https://schema.org/" typeof="Product">
<span property="description">

<p>Trademark Disclaimer: All trademarks, brand names, and logos are the property of their respective owners and are used strictly for identification and compatibility purposes only. We are an independent retailer and are not affiliated with, endorsed by, or authorised by any original equipment manufacturer or brand owner.<br></p>

</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- DISCLAIMER END -->

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
<p>Part Hive is a family-led business with over 30 years of hands-on experience in the motorcycle and scooter industry. Built by mechanics, engineers, and riders, our foundation comes from real workshop knowledge and a deep understanding of quality, performance, and reliability.</p>
<p>Today, our focus goes beyond maintaining bikes. We believe every component matters. Every bolt, every mechanism, and every moving part is refined with precision, care, and true engineering understanding.</p>
<p>We take great pride in our eBay store and are committed to delivering outstanding service, honest quality, and dependable parts to every customer. Through modern logistics and online sales, Part Hive proudly serves riders across countries and continents, helping bring the global riding community closer together.</p>
<p><b>Quality parts. Trusted experience. Powered by Part Hive.</b></p>
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

<ul class="tab_bullet_list">
<li>All products are subject to a thorough quality control inspection before shipping.</li>
<li>Sealed items may be opened to check for any damage or discrepancies prior to dispatch.</li>
<li>This process helps us ensure that each customer receives the correct item in excellent condition.</li>
</ul>

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
      toast.success("HTML Snippet copied to clipboard!", {
        position: "bottom-right",
        icon: (
          <CircleCheckIcon className="size-5 shrink-0 text-white" aria-hidden />
        ),
        style: {
          background: "rgb(22 163 74)",
          color: "rgb(255 255 255)",
          border: "1px solid rgb(21 128 61)",
        },
      });
    });
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex-1 bg-linear-to-b from-muted/50 via-background to-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <Card className="border-border/80 shadow-md shadow-black/5 dark:shadow-black/20">
          <CardHeader className="space-y-2 border-b border-border/60 pb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Description generator
            </CardTitle>
            <CardDescription className="text-pretty text-base leading-relaxed">
              Create a Part Hive eBay listing HTML snippet from your product
              details. Required fields are marked. Generate, then copy the
              output into your listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-10"
            >
              <section className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Product details
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Core copy used in the listing title and overview.
                  </p>
                </div>
                <Field className="flex flex-col gap-2">
                  <FieldLabel htmlFor="productTitle">
                    Product title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="productTitle"
                    type="text"
                    placeholder="e.g. OEM brake pads — fits listed models"
                    {...register("productTitle")}
                    required
                  />
                </Field>

                <Field className="flex flex-col gap-2">
                  <FieldLabel htmlFor="productOverview">
                    Product overview <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="productOverview"
                    placeholder="Short description for the listing body…"
                    rows={5}
                    className="min-h-[120px] resize-y"
                    {...register("productOverview")}
                    required
                  />
                </Field>
              </section>

              <Separator />

              <section className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Specifications
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bullet lists appear under Key features and Perfect for.
                  </p>
                </div>

                <Field className="flex flex-col gap-3">
                  <FieldLabel>Key features</FieldLabel>
                  <div className="flex flex-col gap-2">
                    {keyFeaturesList.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder={`Feature ${index + 1}`}
                          value={feature}
                          onChange={(e) => {
                            const updatedFeatures = [...keyFeaturesList];
                            updatedFeatures[index] = e.target.value;
                            setKeyFeaturesList(updatedFeatures);
                          }}
                          className="flex-1"
                        />
                        {keyFeaturesList.length > 1 ? (
                          <Button
                            type="button"
                            onClick={() => deleteKeyFeature(index)}
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove feature ${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <div
                            className="size-8 shrink-0 sm:size-9"
                            aria-hidden
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Wrapper avoids Field’s [&>*]:w-full stretching the button full width */}
                  <div className="flex w-full justify-start">
                    <Button
                      type="button"
                      onClick={addKeyFeature}
                      size="xs"
                      aria-label="Add key feature"
                      className="h-7 w-fit min-w-0 shrink-0 gap-0.5 border-0 bg-emerald-600 px-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <Plus className="size-3" />
                      Add
                    </Button>
                  </div>
                </Field>

                <Field className="flex flex-col gap-3">
                  <FieldLabel>Perfect for</FieldLabel>
                  <div className="flex flex-col gap-2">
                    {perfectForList.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder={`Use case ${index + 1}`}
                          value={item}
                          onChange={(e) => {
                            const updatedItems = [...perfectForList];
                            updatedItems[index] = e.target.value;
                            setPerfectForList(updatedItems);
                          }}
                          className="flex-1"
                        />
                        {perfectForList.length > 1 ? (
                          <Button
                            type="button"
                            onClick={() => deletePerfectFor(index)}
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove use case ${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <div
                            className="size-8 shrink-0 sm:size-9"
                            aria-hidden
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex w-full justify-start">
                    <Button
                      type="button"
                      onClick={addPerfectFor}
                      size="xs"
                      aria-label="Add use case"
                      className="h-7 w-fit min-w-0 shrink-0 gap-0.5 border-0 bg-emerald-600 px-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <Plus className="size-3" />
                      Add
                    </Button>
                  </div>
                </Field>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Compatibility table
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. One row per line: Make, Model, Year, CCM,
                    Submodel, Street name. Year ranges like 2015-2020 expand
                    automatically.
                  </p>
                </div>
                <Field className="flex flex-col gap-3">
                  <FieldLabel htmlFor="compatibilityTable">
                    Vehicle compatibility
                  </FieldLabel>
                  {!showCompatibilityTableForm ? (
                    <Button
                      type="button"
                      onClick={() => setShowCompatibilityTableForm(true)}
                      variant="outline"
                      size="sm"
                      className="w-fit gap-1.5"
                    >
                      <Plus className="size-4" />
                      Add compatibility table
                    </Button>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <FieldDescription className="sm:max-w-[85%]">
                          Enter one vehicle per line, comma-separated fields.
                        </FieldDescription>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeCompatibilityTable}
                          className="w-fit shrink-0 gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Remove table
                        </Button>
                      </div>
                      <Textarea
                        id="compatibilityTable"
                        rows={6}
                        className="min-h-[140px] resize-y font-mono text-sm"
                        {...register("compatibilityTable")}
                        placeholder="Make, Model, Year, CCM, Submodel, Street Name"
                      />
                    </>
                  )}
                </Field>
              </section>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Output opens in a dialog. Use{" "}
                  <span className="font-medium text-foreground">
                    Copy to clipboard
                  </span>{" "}
                  to paste into eBay.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full shrink-0 sm:w-auto sm:min-w-[180px]"
                  disabled={loading}
                >
                  {loading ? "Generating…" : "Generate HTML"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>

      <AlertDialog
        open={showDialog}
        onOpenChange={(open) => setShowDialog(open)}
      >
        <AlertDialogContent className="flex max-h-[min(90vh,800px)] w-full max-w-[min(100vw-2rem,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <AlertDialogHeader className="flex shrink-0 flex-col items-stretch gap-2 border-b border-border px-6 py-4 text-left sm:place-items-start">
            <AlertDialogTitle className="text-lg">
              Generated HTML snippet
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-muted-foreground">
                Copy this HTML into your eBay item description editor.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
            <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-4 font-mono text-[11px] leading-relaxed text-foreground sm:text-xs">
              {generateHTMLSnippet()}
            </pre>
          </div>
          <AlertDialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={copyToClipboard}>
              Copy to clipboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
