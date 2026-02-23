CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
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
    'user'
);


--
-- Name: check_admin_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_admin_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if this email should be admin
  IF NEW.email IN ('ganga@leadsx1b.com', 'isaaclucianosr@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  starter_plan_id UUID;
BEGIN
  -- Get starter plan ID
  SELECT id INTO starter_plan_id FROM public.plans WHERE slug = 'starter' LIMIT 1;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, plan_id, subscription_end)
  VALUES (
    NEW.id, 
    NEW.email,
    starter_plan_id,
    now() + interval '1 month'
  );
  
  -- Assign user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
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
-- Name: set_admin_by_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_admin_by_email(_email text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO _user_id FROM auth.users WHERE email = _email;
  
  IF _user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
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
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid,
    action text NOT NULL,
    target_user_id uuid,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: apify_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apify_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    api_key text NOT NULL,
    is_valid boolean DEFAULT false,
    last_tested_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: apify_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apify_searches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    search_type text NOT NULL,
    search_params jsonb NOT NULL,
    run_id text,
    dataset_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    total_results integer DEFAULT 0,
    estimated_cost numeric(10,2),
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT apify_searches_search_type_check CHECK ((search_type = ANY (ARRAY['local'::text, 'urls'::text, 'manual_xml'::text]))),
    CONSTRAINT apify_searches_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'succeeded'::text, 'failed'::text])))
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    search_id uuid,
    user_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    country text,
    phone text,
    email text,
    website text,
    rating numeric(3,2),
    reviews_count integer DEFAULT 0,
    categories text[],
    google_url text,
    priority_score integer DEFAULT 0,
    is_contacted boolean DEFAULT false,
    observations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    whatsapp_sent boolean DEFAULT false,
    whatsapp_sent_at timestamp with time zone,
    profile_id uuid
);


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    duration_months integer DEFAULT 1 NOT NULL,
    leads_limit integer DEFAULT 1000 NOT NULL,
    has_api_access boolean DEFAULT false,
    has_white_label boolean DEFAULT false,
    is_unlimited boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    company_name text,
    plan_id uuid,
    subscription_start timestamp with time zone DEFAULT now(),
    subscription_end timestamp with time zone,
    leads_used_this_month integer DEFAULT 0,
    leads_reset_date timestamp with time zone DEFAULT (date_trunc('month'::text, now()) + '1 mon'::interval),
    account_status text DEFAULT 'active'::text,
    account_type text DEFAULT 'regular'::text,
    last_login_at timestamp with time zone,
    days_active integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_account_status_check CHECK ((account_status = ANY (ARRAY['active'::text, 'paused'::text, 'expired'::text, 'deleted'::text]))),
    CONSTRAINT profiles_account_type_check CHECK ((account_type = ANY (ARRAY['regular'::text, 'fundador'::text, 'teste'::text, 'parceiro'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: apify_config apify_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apify_config
    ADD CONSTRAINT apify_config_pkey PRIMARY KEY (id);


--
-- Name: apify_searches apify_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apify_searches
    ADD CONSTRAINT apify_searches_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: plans plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


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
-- Name: apify_config update_apify_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_apify_config_updated_at BEFORE UPDATE ON public.apify_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: apify_searches update_apify_searches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_apify_searches_updated_at BEFORE UPDATE ON public.apify_searches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: admin_logs admin_logs_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: leads leads_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: leads leads_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_search_id_fkey FOREIGN KEY (search_id) REFERENCES public.apify_searches(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Admins can insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: plans Anyone can view active plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Only admins can delete profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_logs Only admins can insert logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: plans Only admins can manage plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage plans" ON public.plans USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_logs Only admins can view logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view logs" ON public.admin_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: apify_config Users can delete their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own config" ON public.apify_config FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: leads Users can delete their own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: apify_searches Users can delete their own searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own searches" ON public.apify_searches FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: apify_config Users can insert their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own config" ON public.apify_config FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users can insert their own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: apify_searches Users can insert their own searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own searches" ON public.apify_searches FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: apify_config Users can update their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own config" ON public.apify_config FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: leads Users can update their own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: apify_searches Users can update their own searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own searches" ON public.apify_searches FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: apify_config Users can view their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own config" ON public.apify_config FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: leads Users can view their own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: apify_searches Users can view their own searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own searches" ON public.apify_searches FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: admin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: apify_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.apify_config ENABLE ROW LEVEL SECURITY;

--
-- Name: apify_searches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.apify_searches ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


