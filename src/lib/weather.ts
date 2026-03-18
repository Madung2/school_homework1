const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function nowKst(): Date {
  return new Date(Date.now() + KST_OFFSET_MS);
}

/** 오늘 날짜 YYYYMMDD (KST) */
export function getBaseDate(): string {
  const d = nowKst();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * 초단기실황 발표 시각 (매시 정시).
 * "매시각 10분 이후에 해당 시각 자료 이용 가능" → 현재 시각 - 10분 후 그 이하 정시.
 */
export function getBaseTimeNcst(): string {
  const d = new Date(Date.now() + KST_OFFSET_MS - 10 * 60 * 1000);
  const h = d.getUTCHours();
  const hour = String(h).padStart(2, "0");
  return `${hour}00`;
}

/**
 * 초단기예보 발표 시각 (매시 00분 또는 30분).
 * 10분 이후 이용 가능 규칙 적용.
 */
export function getBaseTimeFcst(): string {
  const d = new Date(Date.now() + KST_OFFSET_MS - 10 * 60 * 1000);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const minute = m < 30 ? "00" : "30";
  const hour = String(h).padStart(2, "0");
  return `${hour}${minute}`;
}

/** 초단기실황 base_date: 자정 넘겼을 때 전날로 할 수 있음. 실황은 정시 직후에는 전날 23:00 등이 나올 수 있음. */
export function getBaseDateNcst(): string {
  const d = new Date(Date.now() + KST_OFFSET_MS - 10 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function getBaseDateFcst(): string {
  return getBaseDateNcst();
}

/** 서울 격자 좌표 (기본값) */
export const DEFAULT_NX = 60;
export const DEFAULT_NY = 127;

const BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

export type NcstItem = {
  baseDate: string;
  baseTime: string;
  category: string;
  obsrValue: string;
  nx: number;
  ny: number;
};

export type FcstItem = {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
};

type KmaResponse<T> = {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      items?: { item: T[] | T };
      totalCount?: number;
    };
  };
};

function toArray<T>(item: T[] | T | undefined): T[] {
  if (item == null) return [];
  return Array.isArray(item) ? item : [item];
}

function buildParams(
  baseDate: string,
  baseTime: string,
  nx: number,
  ny: number,
  serviceKey: string
): string {
  const params = new URLSearchParams({
    serviceKey,
    pageNo: "1",
    numOfRows: "100",
    dataType: "JSON",
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });
  return params.toString();
}

export async function fetchUltraSrtNcst(serviceKey: string, nx = DEFAULT_NX, ny = DEFAULT_NY) {
  const baseDate = getBaseDateNcst();
  const baseTime = getBaseTimeNcst();
  const url = `${BASE_URL}/getUltraSrtNcst?${buildParams(baseDate, baseTime, nx, ny, serviceKey)}`;
  const res = await fetch(url);
  const data: KmaResponse<NcstItem> = await res.json();
  if (data.response?.header?.resultCode !== "00") {
    throw new Error(data.response?.header?.resultMsg || "초단기실황 조회 실패");
  }
  return toArray(data.response?.body?.items?.item);
}

export async function fetchUltraSrtFcst(serviceKey: string, nx = DEFAULT_NX, ny = DEFAULT_NY) {
  const baseDate = getBaseDateFcst();
  const baseTime = getBaseTimeFcst();
  const url = `${BASE_URL}/getUltraSrtFcst?${buildParams(baseDate, baseTime, nx, ny, serviceKey)}`;
  const res = await fetch(url);
  const data: KmaResponse<FcstItem> = await res.json();
  if (data.response?.header?.resultCode !== "00") {
    throw new Error(data.response?.header?.resultMsg || "초단기예보 조회 실패");
  }
  return toArray(data.response?.body?.items?.item);
}
