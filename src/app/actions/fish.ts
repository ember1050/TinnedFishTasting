"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createFish(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Admin access required." };
  }

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const fish_type = formData.get("fish_type") as string;
  const price_usd = parseFloat(formData.get("price_usd") as string);
  const weight_g = parseFloat(formData.get("weight_g") as string);
  const calories = parseFloat(formData.get("calories") as string);
  const protein_g = parseFloat(formData.get("protein_g") as string);
  const fat_g = formData.get("fat_g") ? parseFloat(formData.get("fat_g") as string) : null;
  const sodium_mg = formData.get("sodium_mg") ? parseFloat(formData.get("sodium_mg") as string) : null;
  const description = (formData.get("description") as string) || null;
  const sourcing_notes = (formData.get("sourcing_notes") as string) || null;

  if (!name || !brand || !fish_type || !price_usd || !weight_g || !calories || !protein_g) {
    return { error: "Required fields: name, brand, type, price, weight, calories, protein." };
  }

  const { error } = await supabase.from("fish").insert({
    name,
    brand,
    fish_type,
    price_usd,
    weight_g,
    calories,
    protein_g,
    fat_g,
    sodium_mg,
    description,
    sourcing_notes,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/fish");
}

export async function updateFish(fishId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Admin access required." };
  }

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const fish_type = formData.get("fish_type") as string;
  const price_usd = parseFloat(formData.get("price_usd") as string);
  const weight_g = parseFloat(formData.get("weight_g") as string);
  const calories = parseFloat(formData.get("calories") as string);
  const protein_g = parseFloat(formData.get("protein_g") as string);
  const fat_g = formData.get("fat_g") ? parseFloat(formData.get("fat_g") as string) : null;
  const sodium_mg = formData.get("sodium_mg") ? parseFloat(formData.get("sodium_mg") as string) : null;
  const description = (formData.get("description") as string) || null;
  const sourcing_notes = (formData.get("sourcing_notes") as string) || null;

  if (!name || !brand || !fish_type || !price_usd || !weight_g || !calories || !protein_g) {
    return { error: "Required fields: name, brand, type, price, weight, calories, protein." };
  }

  const { error } = await supabase
    .from("fish")
    .update({
      name,
      brand,
      fish_type,
      price_usd,
      weight_g,
      calories,
      protein_g,
      fat_g,
      sodium_mg,
      description,
      sourcing_notes,
    })
    .eq("id", fishId);

  if (error) {
    return { error: error.message };
  }

  redirect(`/fish/${fishId}`);
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a review." };
  }

  const fish_id = formData.get("fish_id") as string;
  const flavor_score = parseInt(formData.get("flavor_score") as string);
  const texture_score = parseInt(formData.get("texture_score") as string);
  const aesthetics_score = parseInt(formData.get("aesthetics_score") as string);
  const value_score = parseInt(formData.get("value_score") as string);
  const overall_score = parseInt(formData.get("overall_score") as string);
  const notes = (formData.get("notes") as string) || null;

  if (!fish_id || !flavor_score || !texture_score || !aesthetics_score || !value_score || !overall_score) {
    return { error: "All score fields are required." };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    fish_id,
    flavor_score,
    texture_score,
    aesthetics_score,
    value_score,
    overall_score,
    notes,
    is_from_tasting: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reviewed this fish." };
    }
    return { error: error.message };
  }

  redirect(`/fish/${fish_id}`);
}
