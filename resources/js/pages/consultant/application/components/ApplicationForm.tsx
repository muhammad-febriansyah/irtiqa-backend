import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ApplicationFormData {
    full_name: string;
    phone: string;
    province: string;
    city: string;
    certification_type: string;
    certification_number?: string;
    certification_file?: FileList;
    experience_years: number;
    bio: string;
    specializations?: string;
}

interface Props {
    onSuccess: () => void;
}

const certificationTypes = [
    { value: 'psikolog', label: 'Psikolog' },
    { value: 'konselor', label: 'Konselor' },
    { value: 'kyai', label: 'Kyai/Ustadz' },
    { value: 'therapist', label: 'Therapist' },
    { value: 'other', label: 'Lainnya' },
];

// Sample provinces - in production, you might want to fetch this from an API
const provinces = [
    'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan',
    'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
    'Banten', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
    'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
    'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
    'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat',
];

export default function ApplicationForm({ onSuccess }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ApplicationFormData>();

    const certificationType = watch('certification_type');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                return;
            }

            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error('Format file harus PDF, JPG, atau PNG');
                return;
            }

            setSelectedFile(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setValue('certification_file', undefined);
    };

    const onSubmit = async (data: ApplicationFormData) => {
        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('full_name', data.full_name);
            formData.append('phone', data.phone);
            formData.append('province', data.province);
            formData.append('city', data.city);
            formData.append('certification_type', data.certification_type);
            formData.append('experience_years', data.experience_years.toString());
            formData.append('bio', data.bio);

            if (data.certification_number) {
                formData.append('certification_number', data.certification_number);
            }

            if (data.specializations) {
                formData.append('specializations', data.specializations);
            }

            if (selectedFile) {
                formData.append('certification_file', selectedFile);
            }

            const response = await axios.post('/api/v1/consultant-applications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error submitting application:', error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key][0]);
                });
            } else {
                toast.error(error.response?.data?.message || 'Gagal mengajukan aplikasi');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Form Aplikasi Konsultan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informasi Pribadi</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="full_name"
                                    {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.full_name && (
                                    <p className="text-sm text-red-500">{errors.full_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Nomor Telepon <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    {...register('phone', { required: 'Nomor telepon wajib diisi' })}
                                    placeholder="08xxxxxxxxxx"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="province">
                                    Provinsi <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => setValue('province', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih provinsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province} value={province}>
                                                {province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.province && (
                                    <p className="text-sm text-red-500">{errors.province.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">
                                    Kota/Kabupaten <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    {...register('city', { required: 'Kota/Kabupaten wajib diisi' })}
                                    placeholder="Masukkan kota/kabupaten"
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-500">{errors.city.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certification Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informasi Sertifikasi</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="certification_type">
                                    Tipe Sertifikasi <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => setValue('certification_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe sertifikasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {certificationTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.certification_type && (
                                    <p className="text-sm text-red-500">{errors.certification_type.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="certification_number">Nomor Sertifikat</Label>
                                <Input
                                    id="certification_number"
                                    {...register('certification_number')}
                                    placeholder="Masukkan nomor sertifikat (opsional)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience_years">
                                    Pengalaman (Tahun) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="experience_years"
                                    type="number"
                                    min="0"
                                    {...register('experience_years', {
                                        required: 'Pengalaman wajib diisi',
                                        min: { value: 0, message: 'Pengalaman minimal 0 tahun' },
                                    })}
                                    placeholder="0"
                                />
                                {errors.experience_years && (
                                    <p className="text-sm text-red-500">{errors.experience_years.message}</p>
                                )}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="certification_file">
                                File Sertifikat (PDF, JPG, PNG - Max 5MB)
                            </Label>

                            {!selectedFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                                    <input
                                        id="certification_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="certification_file" className="cursor-pointer">
                                        <Upload className="mx-auto size-12 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Klik untuk upload file sertifikat
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PDF, JPG, atau PNG (Max 5MB)
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {filePreview ? (
                                                <img
                                                    src={filePreview}
                                                    alt="Preview"
                                                    className="size-16 object-cover rounded"
                                                />
                                            ) : (
                                                <FileText className="size-16 text-gray-400" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informasi Profesional</h3>

                        <div className="space-y-2">
                            <Label htmlFor="bio">
                                Bio/Deskripsi Diri <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="bio"
                                {...register('bio', {
                                    required: 'Bio wajib diisi',
                                    maxLength: { value: 1000, message: 'Bio maksimal 1000 karakter' },
                                })}
                                placeholder="Ceritakan tentang diri Anda, pengalaman, dan pendekatan konseling..."
                                rows={5}
                                maxLength={1000}
                            />
                            {errors.bio && (
                                <p className="text-sm text-red-500">{errors.bio.message}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                {watch('bio')?.length || 0}/1000 karakter
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specializations">Spesialisasi</Label>
                            <Textarea
                                id="specializations"
                                {...register('specializations', {
                                    maxLength: { value: 500, message: 'Spesialisasi maksimal 500 karakter' },
                                })}
                                placeholder="Contoh: Konseling Pernikahan, Trauma, Kecemasan, dll. (opsional)"
                                rows={3}
                                maxLength={500}
                            />
                            {errors.specializations && (
                                <p className="text-sm text-red-500">{errors.specializations.message}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                {watch('specializations')?.length || 0}/500 karakter
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="submit" disabled={submitting} size="lg">
                            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {submitting ? 'Mengirim...' : 'Ajukan Aplikasi'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
