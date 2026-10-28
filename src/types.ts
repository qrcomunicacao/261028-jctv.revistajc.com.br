export type FileType = 'folder' | 'video' | 'image' | 'pdf' | 'zip' | 'document' | 'audio';

export type CloudProvider = 'azure' | 'backblaze';

export interface FileItem {
  id: number | string;
  name: string;
  type: FileType;
  cloud: CloudProvider;
  size: number; // in MB (0 for folders)
  date: string;
  path: string;
  accessTier?: string;
  blobType?: string;
  contentType?: string;
}

export interface TransferQueueItem {
  id: number | string;
  name: string;
  type: FileType;
  cloud: CloudProvider;
  to: CloudProvider;
  timestamp: string;
  size: number;
}

export type PageId = 'dashboard' | 'all' | 'azure' | 'backblaze' | 'transfer' | 'activity';

export type FilterType = 'all' | 'folder' | 'video' | 'image' | 'pdf';

export type ViewMode = 'list' | 'grid';

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AzureConnectionStatus {
  accountName: string;
  container: string;
  endpoint: string;
  containerUrl: string;
  region: string;
  subscription: string;
  resourceGroup: string;
  accessTierDefault: string;
  isLiveConnected: boolean;
  connectionMode: 'live_cloud' | 'cloud_mirror';
  availableContainers: string[];
  totalCachedItemsInDrive: number;
  grantedTo: string;
  etag?: string;
  leaseState?: string;
  blobPublicAccess?: string;
  lastModified?: string;
  accessScope?: string;
  hasSasToken?: boolean;
  lastError?: string | null;
}

export interface B2BucketInfo {
  name: string;
  id: string;
}

export interface B2ConnectionStatus {
  buckets: B2BucketInfo[];
  currentBucket: string;
  keyName: string;
  endpoint: string;
  region: string;
  hasCredentials: boolean;
  isLiveConnected: boolean;
  lastError?: string | null;
}

export interface B2VerifyResult {
  verified: boolean;
  bucket: string;
  itemPath: string;
  isFolder: boolean;
  totalObjects: number;
  totalBytes: number;
  files: Array<{
    key: string;
    name: string;
    size: number;
    lastModified: string;
    eTag?: string;
  }>;
  verifiedAt: string;
  cacheNote?: string;
}

