CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: dosage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dosage_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    strain_name text NOT NULL,
    dosage_amount numeric NOT NULL,
    dosage_unit text DEFAULT 'g'::text NOT NULL,
    consumption_method text DEFAULT 'inhalation'::text NOT NULL,
    effects_noted text,
    symptom_relief integer,
    side_effects text,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dosage_logs_symptom_relief_check CHECK (((symptom_relief >= 1) AND (symptom_relief <= 10)))
);


--
-- Name: drgreen_cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drgreen_cart (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    strain_id text NOT NULL,
    strain_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: drgreen_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drgreen_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    drgreen_client_id text NOT NULL,
    country_code text DEFAULT 'PT'::text NOT NULL,
    is_kyc_verified boolean DEFAULT false,
    admin_approval text DEFAULT 'PENDING'::text,
    kyc_link text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: drgreen_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drgreen_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    drgreen_order_id text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    payment_status text DEFAULT 'PENDING'::text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.drgreen_orders REPLICA IDENTITY FULL;


--
-- Name: generated_product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id text NOT NULL,
    product_name text NOT NULL,
    original_image_url text,
    generated_image_url text NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prescription_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    file_type text NOT NULL,
    upload_date timestamp with time zone DEFAULT now() NOT NULL,
    expiry_date date,
    document_type text DEFAULT 'prescription'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_notes text,
    expiry_notification_sent boolean DEFAULT false,
    expiry_notification_sent_at timestamp with time zone
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: strain_knowledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strain_knowledge (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    strain_name text NOT NULL,
    source_url text NOT NULL,
    source_name text NOT NULL,
    country_code text DEFAULT 'PT'::text NOT NULL,
    category text DEFAULT 'dispensary'::text NOT NULL,
    scraped_content text,
    medical_conditions text[],
    effects text[],
    patient_reviews text,
    product_info jsonb DEFAULT '{}'::jsonb,
    last_scraped_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: strains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'Hybrid'::text NOT NULL,
    flavors text[] DEFAULT '{}'::text[],
    helps_with text[] DEFAULT '{}'::text[],
    feelings text[] DEFAULT '{}'::text[],
    thc_content numeric DEFAULT 0 NOT NULL,
    cbd_content numeric DEFAULT 0 NOT NULL,
    cbg_content numeric DEFAULT 0 NOT NULL,
    image_url text,
    client_url text,
    brand_name text DEFAULT 'Dr. Green'::text,
    retail_price numeric DEFAULT 0 NOT NULL,
    availability boolean DEFAULT true NOT NULL,
    stock integer DEFAULT 100 NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dosage_logs dosage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dosage_logs
    ADD CONSTRAINT dosage_logs_pkey PRIMARY KEY (id);


--
-- Name: drgreen_cart drgreen_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_pkey PRIMARY KEY (id);


--
-- Name: drgreen_cart drgreen_cart_user_id_strain_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_user_id_strain_id_key UNIQUE (user_id, strain_id);


--
-- Name: drgreen_clients drgreen_clients_drgreen_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_drgreen_client_id_key UNIQUE (drgreen_client_id);


--
-- Name: drgreen_clients drgreen_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_pkey PRIMARY KEY (id);


--
-- Name: drgreen_clients drgreen_clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_user_id_key UNIQUE (user_id);


--
-- Name: drgreen_orders drgreen_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_orders
    ADD CONSTRAINT drgreen_orders_pkey PRIMARY KEY (id);


--
-- Name: generated_product_images generated_product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_product_images
    ADD CONSTRAINT generated_product_images_pkey PRIMARY KEY (id);


--
-- Name: generated_product_images generated_product_images_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_product_images
    ADD CONSTRAINT generated_product_images_product_id_key UNIQUE (product_id);


--
-- Name: prescription_documents prescription_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_documents
    ADD CONSTRAINT prescription_documents_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: strain_knowledge strain_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strain_knowledge
    ADD CONSTRAINT strain_knowledge_pkey PRIMARY KEY (id);


--
-- Name: strain_knowledge strain_knowledge_strain_name_source_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strain_knowledge
    ADD CONSTRAINT strain_knowledge_strain_name_source_url_key UNIQUE (strain_name, source_url);


--
-- Name: strains strains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strains
    ADD CONSTRAINT strains_pkey PRIMARY KEY (id);


--
-- Name: strains strains_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strains
    ADD CONSTRAINT strains_sku_key UNIQUE (sku);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_generated_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_product_images_product_id ON public.generated_product_images USING btree (product_id);


--
-- Name: idx_strain_knowledge_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strain_knowledge_country ON public.strain_knowledge USING btree (country_code);


--
-- Name: idx_strain_knowledge_strain_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strain_knowledge_strain_name ON public.strain_knowledge USING btree (strain_name);


--
-- Name: idx_strains_availability; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strains_availability ON public.strains USING btree (availability);


--
-- Name: idx_strains_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strains_sku ON public.strains USING btree (sku);


--
-- Name: idx_strains_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strains_type ON public.strains USING btree (type);


--
-- Name: drgreen_cart update_drgreen_cart_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_drgreen_cart_updated_at BEFORE UPDATE ON public.drgreen_cart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drgreen_clients update_drgreen_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_drgreen_clients_updated_at BEFORE UPDATE ON public.drgreen_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drgreen_orders update_drgreen_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_drgreen_orders_updated_at BEFORE UPDATE ON public.drgreen_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: generated_product_images update_generated_product_images_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_generated_product_images_updated_at BEFORE UPDATE ON public.generated_product_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prescription_documents update_prescription_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prescription_documents_updated_at BEFORE UPDATE ON public.prescription_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: strain_knowledge update_strain_knowledge_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_strain_knowledge_updated_at BEFORE UPDATE ON public.strain_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: strains update_strains_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_strains_updated_at BEFORE UPDATE ON public.strains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dosage_logs dosage_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dosage_logs
    ADD CONSTRAINT dosage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: drgreen_cart drgreen_cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: drgreen_clients drgreen_clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prescription_documents prescription_documents_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_documents
    ADD CONSTRAINT prescription_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: prescription_documents prescription_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_documents
    ADD CONSTRAINT prescription_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: strain_knowledge Admins can manage strain knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage strain knowledge" ON public.strain_knowledge USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: strains Admins can manage strains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage strains" ON public.strains USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: prescription_documents Admins can update all prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all prescription documents" ON public.prescription_documents FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: prescription_documents Admins can view all prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all prescription documents" ON public.prescription_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: generated_product_images Anyone can view generated product images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view generated product images" ON public.generated_product_images FOR SELECT USING (true);


--
-- Name: strain_knowledge Anyone can view strain knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view strain knowledge" ON public.strain_knowledge FOR SELECT USING (true);


--
-- Name: strains Anyone can view strains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view strains" ON public.strains FOR SELECT USING ((is_archived = false));


--
-- Name: drgreen_cart Users can delete from their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete from their own cart" ON public.drgreen_cart FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: dosage_logs Users can delete their own dosage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own dosage logs" ON public.dosage_logs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: prescription_documents Users can delete their own prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own prescription documents" ON public.prescription_documents FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: drgreen_cart Users can insert into their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert into their own cart" ON public.drgreen_cart FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: dosage_logs Users can insert their own dosage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own dosage logs" ON public.dosage_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can insert their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own drgreen client" ON public.drgreen_clients FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: drgreen_orders Users can insert their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own orders" ON public.drgreen_orders FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prescription_documents Users can insert their own prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own prescription documents" ON public.prescription_documents FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: drgreen_cart Users can update their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own cart" ON public.drgreen_cart FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: dosage_logs Users can update their own dosage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own dosage logs" ON public.dosage_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can update their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own drgreen client" ON public.drgreen_clients FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: drgreen_orders Users can update their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own orders" ON public.drgreen_orders FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: prescription_documents Users can update their own prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own prescription documents" ON public.prescription_documents FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: drgreen_cart Users can view their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own cart" ON public.drgreen_cart FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: dosage_logs Users can view their own dosage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own dosage logs" ON public.dosage_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can view their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own drgreen client" ON public.drgreen_clients FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: drgreen_orders Users can view their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own orders" ON public.drgreen_orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prescription_documents Users can view their own prescription documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own prescription documents" ON public.prescription_documents FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: dosage_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dosage_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: drgreen_cart; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.drgreen_cart ENABLE ROW LEVEL SECURITY;

--
-- Name: drgreen_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.drgreen_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: drgreen_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.drgreen_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: generated_product_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generated_product_images ENABLE ROW LEVEL SECURITY;

--
-- Name: prescription_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prescription_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: strain_knowledge; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.strain_knowledge ENABLE ROW LEVEL SECURITY;

--
-- Name: strains; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;