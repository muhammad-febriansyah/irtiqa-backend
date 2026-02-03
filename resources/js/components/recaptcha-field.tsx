import { usePage } from '@inertiajs/react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';
import { SharedData } from '@/types';

interface ReCaptchaFieldProps {
    onChange: (token: string | null) => void;
    errorMessage?: string;
}

export default function ReCaptchaField({ onChange, errorMessage }: ReCaptchaFieldProps) {
    const { siteSettings } = usePage<SharedData>().props;
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    if (!siteSettings.recaptcha_site_key) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteSettings.recaptcha_site_key}
                onChange={onChange}
            />
            {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                </p>
            )}
            <input type="hidden" name="recaptcha_token" />
        </div>
    );
}
