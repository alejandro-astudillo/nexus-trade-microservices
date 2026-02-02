package com.nexustrade.wallet.infrastructure.adapter.web.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorPayload {
    private String type;
    private String title;
    private int status;
    private String detail;
    private String instance;
    private String code;
}
